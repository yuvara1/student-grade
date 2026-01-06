import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts/BarChart";
import { Box, Grid, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
export default function Reports() {
  const [mode, setMode] = useState("average"); // average | top5 | rank
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // average data
  const [avgLabels, setAvgLabels] = useState([]);
  const [avgData, setAvgData] = useState([]);
  const [avgRows, setAvgRows] = useState([]);

  // top5 data
  const [topRows, setTopRows] = useState([]);
  const [topLabels, setTopLabels] = useState([]);
  const [topData, setTopData] = useState([]);

  // ranklist data
  const [rankRows, setRankRows] = useState([]);
  const [rankLabels, setRankLabels] = useState([]);
  const [rankData, setRankData] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("http://localhost:3000/subjects");
        if (!mounted) return;
        const s = res.data.rows || [];
        setSubjects(s);
        if (s.length) setSelectedSubject((prev) => prev || String(s[0].id));
      } catch (err) {
        console.error(err);
        setError("Failed to load subjects");
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        if (mode === "average") {
          const res = await axios.get("http://localhost:3000/reports");
          if (!mounted) return;
          if (res.data && res.data.success) {
            setAvgLabels(res.data.labels || []);
            setAvgData(res.data.data || []);
            setAvgRows(res.data.rows || []);
          } else {
            setAvgLabels([]); setAvgData([]); setAvgRows([]);
          }
        } else if (mode === "top5") {
          if (!selectedSubject) {
            setTopRows([]); setTopLabels([]); setTopData([]);
            return;
          }
          const res = await axios.get(`http://localhost:3000/reports/top/${selectedSubject}`);
          if (!mounted) return;
          if (res.data && res.data.success) {
            const rows = res.data.rows || [];
            setTopRows(rows);
            setTopLabels(rows.map((r) => r.Name));
            // map scores or fallback to 0
            setTopData(rows.map((r) => r.score ?? 0));
          } else {
            setTopRows([]); setTopLabels([]); setTopData([]);
          }
        } else if (mode === "topOverall") {
          // fetch top overall students then enrich with averaged attendance (if backend doesn't include it)
          const res = await axios.get("http://localhost:3000/reports/top");
          if (res.data && res.data.success) {
            let rows = res.data.rows || [];

            // try to fetch detailed attendance records to compute average attendance per student
            try {
              const allRes = await axios.get("http://localhost:3000/students/alldetails");
              const allRows = allRes.data.rows || [];
              const attAgg = {};
              allRows.forEach((r) => {
                const roll = String(r.Roll_no ?? "");
                if (!roll) return;
                const aRaw = r.Attendence ?? r.attendance ?? r.att ?? null;
                const n = aRaw == null || aRaw === "" ? NaN : Number(aRaw);
                if (!attAgg[roll]) attAgg[roll] = { sum: 0, count: 0 };
                if (Number.isFinite(n)) {
                  attAgg[roll].sum += n;
                  attAgg[roll].count += 1;
                }
              });

              // attach avg attendance to each top row (fallback to existing r.attendance)
              rows = rows.map((r) => {
                const roll = String(r.Roll_no ?? "");
                const agg = attAgg[roll];
                const avg_att = agg && agg.count ? +(agg.sum / agg.count).toFixed(1) : (r.attendance ?? r.Attendence ?? null);
                return { ...r, attendance: avg_att };
              });
            } catch (e) {
              // ignore attendance enrichment errors - keep whatever server returned
            }

            setTopRows(rows);
            setTopLabels(rows.map((r) => r.Name));
            // show percent (0-100) for chart
            setTopData(rows.map((r) => r.avg_percent ?? (r.avg_score != null ? Number((r.avg_score / 4 * 100).toFixed(1)) : 0)));
          } else {
            setTopRows([]); setTopLabels([]); setTopData([]);
          }
        } else if (mode === "rank") {
          const res = await axios.get("http://localhost:3000/reports/rank");
          if (!mounted) return;
          if (res.data && res.data.success) {
            const rows = res.data.rows || [];
            setRankRows(rows);
            setRankLabels(rows.map((r) => r.Name));
            setRankData(rows.map((r) => r.avg_percent ?? (r.avg_score != null ? Number((r.avg_score / 4 * 100).toFixed(1)) : 0)));
          } else {
            setRankRows([]); setRankLabels([]); setRankData([]);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load report data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [mode, selectedSubject]);
  const navigate = useNavigate();
  return (
    <Box p={2} sx={{ px: { xs: 2, md: 3 } }}>
      <Grid container spacing={2} alignItems="center" justifyContent="space-between" mb={2}>
        <Grid item xs={12} md="auto">
          <Typography variant="h5">Reports</Typography>
        </Grid>

        <Grid item xs={12} md="auto" sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 180 } }}>
            <InputLabel id="mode-label">Report</InputLabel>
            <Select labelId="mode-label" value={mode} label="Report" onChange={(e) => setMode(e.target.value)}>
              <MenuItem value="average">Subject-wise Average</MenuItem>
              <MenuItem value="top5">Top 5 Students (by Subject)</MenuItem>
              <MenuItem value="topOverall">Top 5 Students (Overall)</MenuItem>
              <MenuItem value="rank">Overall Ranklist</MenuItem>
            </Select>
          </FormControl>

          {(mode === "top5" || mode === "average") && (
            <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 220 } }}>
              <InputLabel id="subject-label">Subject</InputLabel>
              <Select labelId="subject-label" value={selectedSubject} label="Subject" onChange={(e) => setSelectedSubject(e.target.value)}>
                {subjects.map((s) => <MenuItem key={s.id} value={String(s.id)}>{s.subject}</MenuItem>)}
              </Select>
            </FormControl>
          )}
          <button onClick={() => navigate(-1)} className="hidden md:inline-flex items-center gap-2 px-3 py-2.5 rounded-md border border-gray-200 bg-white text-sm">
              Go back
            </button>
        </Grid>
        
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {mode === "average" && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Subject-wise Average (percent)</Typography>

                {avgLabels.length ? (
                  <>
                    <Box mb={2} className="responsive-chart">
                      <BarChart xAxis={[{ id: "subjects", data: avgLabels }]} series={[{ data: avgData, label: "Average (%)" }]} height={320} />
                    </Box>

                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Subject</TableCell>
                            <TableCell>Avg (score)</TableCell>
                            <TableCell>Avg (%)</TableCell>
                            <TableCell>Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {avgRows.map((r, i) => (
                            <TableRow key={i}>
                              <TableCell>{r.subject}</TableCell>
                              <TableCell>{r.avg_score !== null ? r.avg_score.toFixed(2) : "-"}</TableCell>
                              <TableCell>{r.avg_percent !== null ? r.avg_percent : "-"}</TableCell>
                              <TableCell>{r.count_grades ?? 0}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <Typography color="textSecondary">No subject averages available.</Typography>
                )}
              </CardContent>
            </Card>
          )}

          {(mode === "top5" || mode === "topOverall") && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {mode === "topOverall" ? `Top ${topRows.length} Students — Overall` : `Top ${topRows.length} — ${subjects.find(s => String(s.id) === String(selectedSubject))?.subject || ""}`}
                </Typography>

                {topRows.length ? (
                  <>
                    <Box mb={2} className="responsive-chart">
                      <BarChart xAxis={[{ id: "students", data: topLabels }]} series={[{ data: topData, label: "Score (0-4 or %)" }]} height={300} />
                    </Box>

                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Student</TableCell>
                            <TableCell>Roll No</TableCell>
                            <TableCell>Grade</TableCell>
                            <TableCell>Attendance</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {topRows.map((r, i) => (
                            <TableRow key={i}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell>{r.Name}</TableCell>
                              <TableCell>{r.Roll_no}</TableCell>
                              <TableCell>{r.grade ?? (r.avg_score != null ? (r.avg_score).toFixed(2) : "-")}</TableCell>
                              <TableCell>{r.attendance ?? "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <Typography color="textSecondary">No grades for selected subject.</Typography>
                )}
              </CardContent>
            </Card>
          )}

          {mode === "rank" && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Overall Ranklist</Typography>

                {rankRows.length ? (
                  <>
                    <Box mb={2} className="responsive-chart">
                      <BarChart xAxis={[{ id: "students", data: rankLabels }]} series={[{ data: rankData, label: "Average (%)" }]} height={360} />
                    </Box>

                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Student</TableCell>
                            <TableCell>Roll No</TableCell>
                            <TableCell>Avg (score)</TableCell>
                            <TableCell>Avg (%)</TableCell>
                            <TableCell>Avg Letter</TableCell>
                            <TableCell>Subjects</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rankRows.map((r, i) => (
                            <TableRow key={i}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell>{r.Name}</TableCell>
                              <TableCell>{r.Roll_no}</TableCell>
                              <TableCell>{r.avg_score !== null ? r.avg_score.toFixed(2) : "-"}</TableCell>
                              <TableCell>{r.avg_percent ?? "-"}</TableCell>
                              <TableCell>{r.avg_letter ?? "-"}</TableCell>
                              <TableCell>{r.subjects_count ?? 0}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <Typography color="textSecondary">No student grades available to generate ranklist.</Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
}

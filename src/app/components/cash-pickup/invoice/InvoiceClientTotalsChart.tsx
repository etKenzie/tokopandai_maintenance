"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type ClientTotalPoint = { label: string; total: number };

type Props = {
  points: ClientTotalPoint[];
  loading: boolean;
};

function formatIdrShort(n: number) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

export default function InvoiceClientTotalsChart({ points, loading }: Props) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  /** Vertical column chart: fixed viewport height; client names on x-axis. */
  const chartHeight = 240;

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        fontFamily: theme.typography.fontFamily,
        foreColor: theme.palette.text.secondary,
        toolbar: { show: points.length > 0 },
        animations: { enabled: points.length <= 40 },
      },
      colors: [primary],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "62%",
          borderRadius: 4,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: points.length <= 12,
        formatter: (val: number) => formatIdrShort(Number(val)),
        style: { fontSize: "11px", colors: [theme.palette.text.primary] },
      },
      grid: {
        borderColor: theme.palette.divider,
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      xaxis: {
        categories: points.map((p) => p.label),
        labels: {
          rotate: points.length > 5 ? -40 : 0,
          rotateAlways: points.length > 5,
          maxHeight: 100,
          trim: true,
          hideOverlappingLabels: true,
          style: { fontSize: "11px" },
        },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => formatIdrShort(Number(val)),
          style: { fontSize: "12px" },
        },
      },
      tooltip: {
        theme: theme.palette.mode === "dark" ? "dark" : "light",
        y: {
          formatter: (val: number) => formatIdrShort(val),
        },
      },
    }),
    [points, primary, theme]
  );

  const series = useMemo(
    () => [
      {
        name: "Total (period)",
        data: points.map((p) => p.total),
      },
    ],
    [points]
  );

  return (
    <Box sx={{ position: "relative", minHeight: 200 }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : points.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4 }}>
          No invoice totals in this period for the chart.
        </Typography>
      ) : (
        <Chart options={options} series={series} type="bar" height={chartHeight} width="100%" />
      )}
    </Box>
  );
}

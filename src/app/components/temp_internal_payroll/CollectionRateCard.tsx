'use client';

import { Box, CircularProgress, LinearProgress, Typography, SxProps, Theme } from '@mui/material';
import React from 'react';
import DashboardCard from '../shared/DashboardCard';

/** Returns a color from red (0) to green (100) in HSL */
function getCollectionRateColor(percent: number): string {
  const hue = (percent / 100) * 120; // 0 = red, 120 = green
  return `hsl(${hue}, 55%, 42%)`;
}

interface CollectionRateCardProps {
  title?: string;
  /** Percentage 0-100 */
  value: number;
  isLoading?: boolean;
  cardSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

const CollectionRateCard: React.FC<CollectionRateCardProps> = ({
  title = 'Collection Rate',
  value,
  isLoading = false,
  cardSx,
  contentSx,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const displayValue = typeof value === 'number' ? value.toFixed(1) : '0.0';
  const rateColor = getCollectionRateColor(clampedValue);

  return (
    <DashboardCard cardSx={cardSx} contentSx={contentSx}>
      <Box
        sx={{
          p: 2,
          minHeight: '96px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: 0.75,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography
              fontWeight="bold"
              sx={{ fontSize: '1.5rem', lineHeight: 1.2, color: rateColor }}
            >
              {displayValue}%
            </Typography>
          )}
        </Box>
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
        {/* Full-bleed at bottom: no horizontal or bottom margins */}
        <Box
          sx={{
            mt: 'auto',
            pt: 1,
            mx: 'calc(-30px - 16px)', // cancel CardContent (30px) + this Box padding (p: 2 = 16px)
            mb: '-30px', // sit flush with card bottom
          }}
        >
          <LinearProgress
            variant="determinate"
            value={clampedValue}
            sx={{
              height: 6,
              borderRadius: 0,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 0,
                backgroundColor: rateColor,
              },
            }}
          />
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default CollectionRateCard;

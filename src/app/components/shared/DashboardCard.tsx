'use client'
import { useTheme } from '@mui/material/styles';
import { Card, CardContent, Typography, Stack, Box, SxProps, Theme } from '@mui/material';
import { CustomizerContext } from '@/app/context/customizerContext';
import { useContext } from 'react';

type Props = {
  title?: string;
  subtitle?: string;
  action?: JSX.Element | any;
  footer?: JSX.Element;
  cardheading?: string | JSX.Element;
  headtitle?: string | JSX.Element;
  headsubtitle?: string | JSX.Element;
  children?: JSX.Element;
  middlecontent?: string | JSX.Element;
  /** Merged into the root `Card` `sx` (e.g. flex stretch in grid rows). */
  cardSx?: SxProps<Theme>;
  /** Merged into `CardContent` `sx` when `cardheading` is not used. */
  contentSx?: SxProps<Theme>;
};

const DashboardCard = ({
  title,
  subtitle,
  children,
  action,
  footer,
  cardheading,
  headtitle,
  headsubtitle,
  middlecontent,
  cardSx,
  contentSx,
}: Props) => {
  const { isCardShadow } = useContext(CustomizerContext);

  const theme = useTheme();
  const borderColor = theme.palette.divider;

  return (
    <Card
      sx={[
        { padding: 0, border: !isCardShadow ? `1px solid ${borderColor}` : 'none' },
        ...(Array.isArray(cardSx) ? cardSx : cardSx ? [cardSx] : []),
      ]}
      elevation={isCardShadow ? 9 : 0}
      variant={!isCardShadow ? 'outlined' : undefined}
    >
      {cardheading ? (
        <CardContent>
          <Typography variant="h5">{headtitle}</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {headsubtitle}
          </Typography>
        </CardContent>
      ) : (
        <CardContent sx={[{ p: '30px' }, ...(Array.isArray(contentSx) ? contentSx : contentSx ? [contentSx] : [])]}>
          {title ? (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              alignItems={'center'}
              mb={3}
            >
              <Box>
                {title ? <Typography variant="h5">{title}</Typography> : ''}

                {subtitle ? (
                  <Typography variant="subtitle2" color="textSecondary">
                    {subtitle}
                  </Typography>
                ) : (
                  ''
                )}
              </Box>
              {action}
            </Stack>
          ) : null}

          {children}
        </CardContent>
      )}

      {middlecontent}
      {footer}
    </Card>
  );
};

export default DashboardCard;

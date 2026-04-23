import { Box } from '@mui/material';
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const InlineItemCard = ({ children }: Props) => (
  <Box
    sx={{
      display: {
        xs: 'flex',
        sm: 'inline-block',
      },
      flexDirection: {
        xs: 'column',
        sm: 'unset',
      },
      '.MuiChip-root, .MuiButton-root': {
        m: '5px',
      },
    }}
  >
    {children}
  </Box>
);

export default InlineItemCard;

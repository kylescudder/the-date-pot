import { AppBar, Dialog, IconButton, Slide, Toolbar, Typography } from '@mui/material';
import { IconCross } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react'
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenModal(props: {
  open: boolean;
	func: (open: boolean) => void;
	form: React.ReactElement;
}) {
  const handleClose = () => {
    setOpen(false);
    props.func(false);
	};
	
	const [open, setOpen] = useState<boolean>(props.open);

  useEffect(() => {
    setOpen(props.open);
	}, [props.open]);
	
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <IconCross width={24} height={24} strokeLinejoin="miter" />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Add Vinyl
          </Typography>
        </Toolbar>
			</AppBar>
			{props.form}
    </Dialog>
  );
}

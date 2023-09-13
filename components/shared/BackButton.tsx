import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { IconArrowNarrowLeft } from '@tabler/icons-react';

export default function BackButton(props: {
  record: any,
  changesMade: boolean
}) {
  const [changesMade, setChangesMade] = useState<boolean>(props.changesMade);

  useEffect(() => {
    setChangesMade(props.changesMade)
  }, [props.changesMade])

	const router = useRouter();
	  const handleBack = () => {
      if (changesMade) {
        const url = `${window.location.protocol}//${window.location.host}`;
        window.location.href = `${url}/vinyls`;
      } else {
        router.back();
      }
    };

	return (
    <Button
      className={`bg-primary-500 text-light-1 ${
        props.record._id === "" ? "hidden" : ""
      }`}
      onClick={handleBack}
      aria-label="back"
    >
      <IconArrowNarrowLeft className="dark:text-light-1 text-dark-1" />
    </Button>
  );
}

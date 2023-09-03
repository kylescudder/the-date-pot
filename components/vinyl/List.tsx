import { IVinyl } from '@/lib/models/vinyl'
import React from 'react'

export default function VinylList(props: {
	vinyls: IVinyl[]
}) {
	console.log(props.vinyls)
	return (
    <>
      {props.vinyls.map((vinyl) => {
				<p>{vinyl.name} by {vinyl.artistName}</p>
      })}
    </>
  );
}

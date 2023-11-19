"use client";

import React, { useState } from "react";
import { useForm } from "@mantine/form";
import { usePathname, useRouter } from "next/navigation";
import { IFilm } from "@/lib/models/film";
import {
  archiveFilm,
  updateFilm,
} from "@/lib/actions/film.action";
import {
  archiveToast,
  successToast,
} from "@/lib/actions/toast.actions";
import { IconTrash } from "@tabler/icons-react";
import BackButton from "../shared/BackButton";
import { Button, Checkbox, MultiSelect, NumberInput, TextInput } from "@mantine/core";
import { DatePickerInput } from '@mantine/dates'
import { option } from "@/lib/models/select-options";
import { IDirector } from "@/lib/models/director";
import { IGenre } from "@/lib/models/genre";
import { IPlatform } from "@/lib/models/platform";

export default function AddFilm(props: {
  film: IFilm;
  directorList: IDirector[];
  genreList: IGenre[];
  platformList: IPlatform[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [changesMade, setChangesMade] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const directorOptions: option[] = props.directorList.map((director: IDirector) => ({
    value: director.directorName,
    label: director.directorName,
  }));
  const genreOptions: option[] = props.genreList.map((genre: IGenre) => ({
    value: genre.genreText,
    label: genre.genreText,
  }));
  const platformOptions: option[] = props.platformList.map((platform: IPlatform) => ({
    value: platform.platformName,
    label: platform.platformName,
  }));

  const filmNote: string = "";

  interface formFilm {
    _id: string;
    addedByID: string;
    addedDate: Date;
    archive: boolean;
    filmName: string;
    releaseDate: Date;
    runTime: number;
    userGroupID: string;
    watched: boolean;
    directors: string[];
    genres: string[];
    platforms: string[];
  }

  const form = useForm({
    initialValues: {
      _id: props.film._id ? props.film._id : "",
      addedByID: props.film.addedByID ? props.film.addedByID : "",
      addedDate: props.film.addedDate ? props.film.addedDate : "",
      archive: props.film.archive ? props.film.archive : false,
      filmName: props.film.filmName
        ? props.film.filmName
        : "",
      releaseDate: props.film.releaseDate ? props.film.releaseDate : "",
      runTime: props.film.runTime ? props.film.runTime : 0,
      userGroupID: props.film.userGroupID
        ? props.film.userGroupID
        : "",
      watched: props.film.watched ? props.film.watched : false,
      directors: props.film.directors ? props.film.directors : [""],
      genres: props.film.genres ? props.film.genres : [""],
      platforms: props.film.platforms ? props.film.platforms : [""],
    },
  });

  const onSubmit = async (values: formFilm) => {
    const payload: IFilm = {
      ...props.film,
      filmName: values.filmName,
      releaseDate: values.releaseDate,
      runTime: values.runTime,
      watched: values.watched,
      directors: values.directors,
      genres: values.genres,
      platforms: values.platforms,
    };

    const film = await updateFilm(payload);
    if (pathname.includes("/film/")) {
      successToast(film.filmName);
      setChangesMade(true);
    } else {
      router.push(`/film/${film._id}`);
    }
  };

  const handleArchive = async () => {
    await archiveFilm(props.film._id);
    archiveToast(props.film.filmName);
    setTimeout(() => {
      const url = `${window.location.protocol}//${window.location.host}`;
      window.location.href = `${url}/films`;
    }, 1000);
  };

  const pullData = (data: boolean) => {
    setOpen(data);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <BackButton
          record={props.film}
          changesMade={changesMade}
          page="films"
        />
        <Button
          className={`bg-danger text-light-1 ${
            props.film._id === "" ? "hidden" : ""
          }`}
          onClick={handleArchive}
          aria-label="archive"
        >
          <IconTrash className="text-light-1" />
        </Button>
      </div>
      <form
        onSubmit={form.onSubmit((values) => onSubmit(values))}
        className={`flex flex-col justify-start gap-10 pt-4 ${
          props.film._id === "" ? "px-6" : ""
        }`}
      >
        <TextInput
          label="Name"
          radius="md"
          placeholder="Which cinematic masterpiece is it today?"
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps("filmName")}
        />
        <DatePickerInput
          label="Release Date"
          radius="md"
          placeholder="How old?!"
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps("releaseDate")}
        />
        <NumberInput
          label="Run time"
          radius="md"
          placeholder="It is over 90 minutes?"
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps("runTime")}
        />
        <Checkbox
          label="Watched"
          radius="md"
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps("watched")}
        />
        <MultiSelect
          multiple={true}
          radius="md"
          size="md"
          clearable
          transitionProps={{ transition: "pop-bottom-left", duration: 200 }}
          label="Directors"
          placeholder="Pick some"
          data={directorOptions}
          {...form.getInputProps("directors")}
        />
        <MultiSelect
          multiple={true}
          radius="md"
          size="md"
          clearable
          transitionProps={{ transition: "pop-bottom-left", duration: 200 }}
          label="Genres"
          placeholder="Pick some"
          data={genreOptions}
          {...form.getInputProps("genres")}
        />
        <MultiSelect
          multiple={true}
          radius="md"
          size="md"
          clearable
          transitionProps={{ transition: "pop-bottom-left", duration: 200 }}
          label="Genres"
          placeholder="Pick some"
          data={platformOptions}
          {...form.getInputProps("platforms")}
        />
        <Button
          radius="md"
          className="bg-primary-500 hover:bg-primary-hover text-light-1"
          type="submit"
        >
          {props.film._id === "" ? "Add" : "Update"} Film
        </Button>
      </form>
    </div>
  );
}

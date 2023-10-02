"use server";

import AddActivity from "@/components/activity/AddActivity";
import { getActivity } from "@/lib/actions/activity.action";
import { getExpenseList } from "@/lib/actions/expense.action";
import { getLongLat } from "@/lib/actions/map.action";
import { getGroupUsers } from "@/lib/actions/user.actions";
import { IActivity } from "@/lib/models/activity";
import { IExpense } from "@/lib/models/expense";
import { IUser } from "@/lib/models/user";

export default async function Activity({ params }: { params: { id: string } }) {
  const activity: IActivity = await getActivity(params.id);
  const expenseList: IExpense[] = await getExpenseList();
  let longLat: number[] = [];
  if (activity.address !== undefined && activity.address !== "") {
    longLat = await getLongLat(activity.address);
  }
  return <AddActivity activity={activity} expenseList={expenseList} longLat={longLat} />;
}

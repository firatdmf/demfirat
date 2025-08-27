import classes from "./page.module.css";
import { redirect } from "next/navigation";
// import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  if(!session){
    redirect('/api/auth/signin?callbackUrl=/')
  }
  const user = session.user;
  return (
    <div className={classes.DashboardPage}>
      <div className={classes.PageTitle}>Dashboard</div>
      <div className={classes.userPanelWrapper}>
        <div className={classes.userPanel}>
          <div className={classes.userPhoto}></div>
          <div className={classes.userName}>{user?.name || user?.email || 'User'}</div>
        </div>
      </div>
    </div>
  );
}

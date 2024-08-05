import styles from "./page.module.css";

import Sidepanel from "@/components/Sidepanel/Sidepanel";
import TopBar from "@/components/Topbar/Topbar";

export default function Home() {
  return (
    <main className={styles.main}>
      <TopBar />
      <Sidepanel />
      <div className={styles.content}></div>
    </main>
  );
}

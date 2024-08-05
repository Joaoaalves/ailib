import style from "./Topbar.module.css"

export default function TopBar(){
    return (
        <div className={style.topbar}>
            <span className={style.title}>AILib</span>
        </div>
    )
}
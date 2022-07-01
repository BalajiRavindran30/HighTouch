// import classNames from "classnames";
import { useEffect } from "react";
// import { NavLink, Outlet } from "react-router-dom";

import { refreshSfmcToken } from "./sfmcClient";

function App() {
    useEffect(() => {
        refreshSfmcToken();
    });

    return (
        <div className="App">
            <h1>HighTouch React_App </h1>
        </div>
    );
}

export default App;

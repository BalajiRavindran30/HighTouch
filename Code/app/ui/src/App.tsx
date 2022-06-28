//import classNames from "classnames";
import { useEffect } from "react";
//import { NavLink, Outlet } from "react-router-dom";

import { refreshSfmcToken } from "./sfmcClient";

function App() {
    useEffect(() => {
        console.log('UseEffect Called::')
        refreshSfmcToken();
    });

    return (
        <div className="App">
            <h1>HighTouch React_Application</h1>
        </div>
    );
}

export default App;

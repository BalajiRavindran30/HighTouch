// import classNames from "classnames";
// import { useEffect } from "react";
import {Route, Link,Routes } from "react-router-dom";
import React from "react";
import { Container } from "react-bootstrap";
// import { refreshSfmcToken } from "./sfmcClient";
import AppDetails from "./ApplicationSetup";
import Config from "./Config";
import Review from "./ReviewSetup";

function App() {
    // useEffect(() => {
    //     refreshSfmcToken();
    // });

    return (
        <div className="App configs" >
            
            <div className="navigation" >
                <div className="navigation-sub">
                <Link to ='/ApplicationSetup'></Link>&nbsp;
                <Link to='/Config'></Link>&nbsp;
                <Link to='/ReviewSetup'></Link>
                </div>
            </div>
            <Container>
            <div className="content">
                <Routes>
                <Route path='/ApplicationSetup' element={<AppDetails />}/>
                <Route path='/Config' element = {<Config />}/>
                <Route path='/ReviewSetup' element = {<Review />}/>
                </Routes>               
            </div>
            </Container>
            
        </div>
       
        
    );
}

export default App;

import React, {  useState } from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card'; 

export default function AppDetails(){  
  const [client , setclientid] = useState("");
  const [secret , setsecret] = useState("");
  const [jwt , setjwt] = useState("");

  const getcid = (e) =>{
    setclientid(e.target.value);
  }
  const getsecret = (e) =>{
    setsecret(e.target.value);
  }
  const getjwt = (e) =>{
    setjwt(e.target.value);
  }
  console.log('CId::',client,'Secret::',secret,"jwt::",jwt);
  
  
    return (

      <div>
       
      <div className="row marginZero">
              <div
                className="col-sm-4 Div1 txtlabel txtCompleted clsUnlink"
                // onClick={onchangeHandler}
              >
                <span className="wrdtext">S2S Application Setup</span>
              </div>
              <div
                className="col-sm-4 Div2 txtlabel txtIncompleted clsUnlink"
                // onClick={onchangeHandler}
              >
                <span className="wrdtext">Configure HighTouch</span>
              </div>
              <div
                className="col-sm-4 Div3 txtlabel txtIncompleted clsUnlink"
                // onClick={onchangeHandler}
              >
                <span className="wrdtext">Review Setup</span>
              </div>
              <div>
         <h2 className="h2txt">hightouch</h2>
       </div>
       </div>
       <div className="cardsec form1">      
        <Card.Title>Server 2 Server Application Details</Card.Title>
        <form>
  <label>
    Client ID <br></br>
    <input type="text" id="clientid" onChange={getcid} className="textBox"/><br></br><br></br>
    Client Secret <br></br>
    <input type="text" id="secret" onChange={getsecret} className="textBox"/> <br></br><br></br>
     JWT Token <br></br>
    <input type="text" id="jwt" onChange={getjwt} style={{width: "400px"}} className="textBox"/> <br></br>
  </label>&nbsp;
  <Button variant="primary" name="verify" className="button1">Verify My Account</Button>
</form>    

      {/* <div className="line"></div><br></br>
      <Card className="cardBody">SFMC App Credentials Verified</Card> */}
      </div><br></br>
      

      <div>
      <Card className="cardfooter">
         <form>
         <Button id="btnCancel">Cancel</Button>
         {/* <Button id="btnNext" ><Link to="/Config">Next</Link></Button> */}
         <a id="button" href="/Config" data-value={client} >Next</a>
         </form>
         </Card>
       </div>
   </div>
              
    );
  }

    
  
  

 

import React  from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card'; 
import { Link } from "react-router-dom";


export default function Config(props){
  console.log('Props::',props.data);
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
                className="col-sm-4 Div2 txtlabel txtCompleted clsUnlink"
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
       <div className="cardsec form2">      
        <Card id='cnfg'>Connect My Experience</Card>
        <Button id='ht' >ht</Button>
        <h2>{props.client}</h2>
      </div><br></br>

      <div>
      <Card className="cardfooter">
         <form>
         <Button id="btnCancel"><Link to="/ApplicationSetup">Cancel</Link></Button>
         <a id="button" href="/ReviewSetup">Next</a>
         </form>
         </Card>
       </div>
   </div>
    );
  }
    



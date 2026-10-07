'use strict';
class OperationLifetime {
  constructor(finishClose) { this.finishClose=finishClose; this.busy=false; this.closeRequested=false; }
  requestClose() { if(!this.busy)return false; this.closeRequested=true; return true; }
  async run(operation) {
    if(this.busy)throw new Error('Another operation is running');
    this.busy=true;
    try{return await operation();}
    finally{this.busy=false;if(this.closeRequested){this.closeRequested=false;this.finishClose();}}
  }
}
module.exports={OperationLifetime};

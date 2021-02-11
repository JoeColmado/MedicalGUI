import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { AppStateService } from 'src/app/app-state.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafetyStopComponent } from '../../Dialogs/safety-stop/safety-stop.component';

@Component({
  templateUrl: './manual-control.component.html',
  styleUrls: ['./manual-control.component.scss']
})
export class ManualControlComponent implements OnInit, OnDestroy {

  testNumber = 19;
  profile: any;
  timeLineData: any[];
  duration = 0;
  dialogRef: any;
  emergencyDialogOpen = false;

  manualControl = true;


  constructor(
    private route: ActivatedRoute,
    public appService: AppStateService,
    public dialog: MatDialog,
  ) {
    this.route.params.subscribe((profile: any) => {
      // TODO Check from where we are coming

      if (profile.data) {
        console.log('profile');
        this.manualControl = false;
        this.profile = JSON.parse(profile.data);
        this.timeLineData = this.profile.data.data.timelineData;
        console.log(this.timeLineData);

        this.timeLineData.forEach((el) => {
          this.duration += el.duration;
        });
      }
      else {
        console.log('manual');

      }
      this.appService.emergency.subscribe((data: any) => {
         console.log(data);
         if (data.state) {
           this.openDialog();

           this.appService.socketEmit({
        event: 'pauseEvent',
      });

         }
         else {
           this.dialogRef.close();
         }
       });

    });
   }


  ngOnInit(): void {

    let mode = 'manual';
    if (!this.manualControl) {
      this.loadProfileData();
      mode = 'profile';
    }

    const serverData = {
      event: 'openControl',
      mode,
    };
    this.appService.socketEmit(serverData);
  }
  ngOnDestroy() {
    const serverData = {
      event: 'closeControl',
    };
    this.appService.socketEmit(serverData);
  }

  loadProfileData() {
    console.log(this.profile.data.data);
    const ServerData = this.profile.data.data.timelineData.map((el) => ({
      type: el.type,
      rawData: el.rawData,
    }));
    // console.log(ServerData);
    this.appService.socketEmit({
      event: 'setScheduleData',
      data: JSON.stringify(ServerData),
    });
  }

  openDialog() {
    this.dialogRef = this.dialog.open(SafetyStopComponent, {
      width: '80%',
      height: '80%',
      panelClass: 'dialogClass',
    });

  }

  selectPressureOption(e) {
    console.log(e.value);
    this.appService.setMotorSpeed();

    // const ServerData = {
    //   event: 'setPressureOption',
    //   newPressureOption: e.value
    // };
    // this.appService.socketEmit(ServerData);

  }

}

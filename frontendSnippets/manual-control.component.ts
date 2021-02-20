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

  // Implement Interfaces
  profile: any;
  timeLineData: any[];

  dialogRef: MatDialogRef;
  duration = 0;
  emergencyDialogOpen = false;
  manualControl = true;


  constructor(
    private route: ActivatedRoute,
    public appService: AppStateService,
    public dialog: MatDialog,
  ) { }

  // Check if ProfileData is loaded
  ngOnInit(): void {
    let mode = 'manual';
    if (!this.manualControl) {
      this.loadProfileData();
      mode = 'profile';
    }
// Inform Server
    const serverData = {
      event: 'openControl',
      mode,
    };
    this.appService.socketEmit(serverData);
  }
// Inform Server that Control has been closed
  ngOnDestroy() {
    const serverData = {
      event: 'closeControl',
    };
    this.appService.socketEmit(serverData);
  }

  subscribeToServerEvents() {
    // Check from where we are coming
    this.route.params.subscribe((profile: any) => {

      if (profile.data) {
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

      // Subscribe to Emmgergency Button
      this.appService.emergency.subscribe((data: any) => {
        //  console.log(data);
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

  // Convert Data for Display it in the Profile Chart
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

  // Open Popupwindow in Case Emergency button has been pushed
  openDialog() {
    this.dialogRef = this.dialog.open(SafetyStopComponent, {
      width: '80%',
      height: '80%',
      panelClass: 'dialogClass',
    });

  }


  // Change pressure option and Inform Server
  selectPressureOption(e) {
    // console.log(e.value);
    this.appService.setMotorSpeed();
  }

}

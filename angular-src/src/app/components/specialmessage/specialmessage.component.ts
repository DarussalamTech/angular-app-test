import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

import { AuthService } from "../../services/auth.service";
import { ChatService } from "../../services/chat.service";
import {Message} from "../../models/message.model";

@Component({
  selector: 'app-specialmessage',
  templateUrl: './specialmessage.component.html',
  styleUrls: ['./specialmessage.component.scss']
})
export class SpecialmessageComponent implements OnInit {
  specialMessageForm: FormGroup;
  username: string;

  constructor(
    private formBuilder: FormBuilder,
    private flashMessagesService: FlashMessagesService,
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService,

  ) { }

  ngOnInit() {
    this.checkLoggedIn();
    this.specialMessageForm = this.formBuilder.group({
       message: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(14) ]],
       amount: ['', [ Validators.required , Validators.minLength(1) ]]
    });

    let userData = this.authService.getUserData();
    this.username = userData.user.username;

  }

  connectToChat(): void {
    let connected = this.chatService.isConnected();
    if (connected == true) {
      this.chatService.receiveMessage()
        .subscribe(message => {

        });
    } else {
      this.chatService.connect(this.username, () => {
        this.chatService.receiveMessage()
          .subscribe(message => {

          });
      });
    }
  }

  checkLoggedIn(): void {
    let userData = this.authService.getUserData();
    if(userData.user === null) {
      this.router.navigate(["/"]);
    }
  }

  onSendMessage(): void {

    let userData = this.authService.getUserData();
    this.authService.getOnlineBuyers().subscribe(Buyers => {

      if(Buyers.user !== null) {
        for(let i=0; i<Buyers.user.length; i++) {
          this.connectToChat();
          this.specialMessageForm.value.type = "Buyer";
          this.specialMessageForm.value.sellerName = userData.user.username;
          this.chatService.sendMessage(this.specialMessageForm.value, Buyers.user[i].username);
          this.flashMessagesService.show("Offer sent!", {cssClass: "alert-success", timeout: 3000});
          this.router.navigate(["/chat"]);
        }
      } else {
        this.flashMessagesService.show("No buyer online!", {cssClass: "alert-danger", timeout: 3000});
        this.router.navigate(["/chat"]);
      }
    });





  }

}

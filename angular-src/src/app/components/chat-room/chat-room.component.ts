import {Component, OnInit, OnDestroy, ElementRef, Output, EventEmitter} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Message } from "../../models/message.model";
import { ChatService } from "../../services/chat.service";
import { AuthService } from "../../services/auth.service";
//import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
  // animations: [
  //   trigger("childAnimation", [
  //
  //   ])
  // ]
  // animations: [
  //   trigger('popOverState', [
  //     // state('small', style({
  //     //   transform: 'scale(1)',
  //     // })),
  //     // state('large', style({
  //     //   transform: 'scale(1.2)',
  //     // })),
  //     // transition('small => large', animate('100ms ease-in')),
  //   ]),
  // ]
})

export class ChatRoomComponent implements OnInit, OnDestroy {

  messagee: Array<any>;
  subscription: Subscription;
  /********************************/


  messageList: Array<Message>;
  userList: Array<any>;
  showActive: boolean;
  sendForm: FormGroup;
  username: string;
  chatWith: string;
  currentOnline: boolean;
  receiveMessageObs: any;
  receiveActiveObs: any;
  noMsg: boolean;
  conversationId: number;
  notify: boolean;
  notification: any = {timeout:null};
  userRoleType : boolean = false;
  state: boolean = false;
  //property for hide n show basis on sent notification from seller
  hideSpecialOfferPopup: boolean = true;
  specialOfferMessage : string;
  specialOfferAmount : number;

  show = false;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private el: ElementRef,
    private authService: AuthService,
    private chatService: ChatService
  ) { }


  ngOnInit() {

    let userData = this.authService.getUserData();
    this.username = userData.user.username;

    if (userData.user.role == "Buyer") {
      this.userRoleType = false;
    } else {
      this.userRoleType = true;
    }






    this.sendForm = this.formBuilder.group({
      message: ['', Validators.required]
    });

    if(this.userRoleType) {
      this.route.params.subscribe((params: Params) => {
        this.chatWith = params.chatWith;
      });
      this.getMessages(this.chatWith);
    }

    this.connectToChat();
  }

  onUserAcceptRequest(username: string): boolean {
    this.connectToChat();
    this.getMessages(username);
    this.state = true;
    this.hideSpecialOfferPopup = true;
    return false;
  }

  onUserRejectRequest() {
    this.state = false;
    this.hideSpecialOfferPopup = true;
    return false;
  }

  ngOnDestroy() {
    this.receiveActiveObs.unsubscribe();
    this.receiveMessageObs.unsubscribe();
  }

  connectToChat(): void {
    let connected = this.chatService.isConnected();
    if (connected == true) {
      if(!this.userRoleType) {
        this.getSpecialOfferMessage();
      } else {
        this.initReceivers()
      }
    } else {
      this.chatService.connect(this.username, () => {
        if(this.userRoleType) {
          this.initReceivers()
        } else {
          this.getSpecialOfferMessage();
        }
      });
    }
  }

  //Buyer receiving special message
  getSpecialOfferMessage(): void {
    //this.getUserList();

    this.receiveMessageObs = this.chatService.receiveMessage()
      .subscribe(message => {
        this.hideSpecialOfferPopup = false;
        this.specialOfferMessage = message.message;
        this.specialOfferAmount = message.amount;
        this.state = false;


        // this.checkMine(message);
        // if (message.conversationId == this.conversationId) {
        //   this.noMsg = false;
        //   this.messageList.push(message);
        //   this.scrollToBottom();
        //   this.msgSound();
        // } else if (message.mine != true) {
        //   if (this.notification.timeout) {clearTimeout(this.notification.timeout)};
        //   this.notification = {
        //     from: message.from,
        //     inChatRoom: message.inChatRoom,
        //     text: message.text,
        //     timeout: setTimeout(()=>{ this.notify = false }, 4000)
        //   };
        //   this.notify = true;
        //   this.notifSound();
        // }
      });
  }

  animateMe() {
    this.state = (this.state === true ? false : true);
  }

  getMessages(name: string): void {
    this.chatService.getConversation(this.username, name).subscribe(data => {
        if (data.success == true) {

          let messages = data.messages || null;
          if (messages && messages.length > 0) {
            for (let message of messages) {
              this.checkMine(message);
            }

            this.noMsg = false;
            this.messageList = messages;
            this.scrollToBottom();
          } else {
            this.noMsg = true;
            this.messageList = [];
          }
        } else {
          this.onNewConv("chat-room");
        }
      });
  }

  getUserList(): void {
    this.chatService.getUserList()
      .subscribe(data => {
        if (data.success == true) {
          let users = data.user;
          for (let i = 0; i < users.length; i++) {
            if (users[i].username == this.username) {
              users.splice(i, 1);
              break;
            }
          }
          this.userList = users.sort(this.compareByUsername);

          this.receiveActiveObs = this.chatService.receiveActiveList()
            .subscribe(users => {
              for(let onlineUsr of users) {
                if (onlineUsr.username != this.username) {
                  let flaggy = 0;
                  for(let registered of this.userList) {
                    if (registered.username == onlineUsr.username) {
                      flaggy = 1;
                      break;
                    }
                  }
                  if (flaggy == 0) {
                    this.userList.push(onlineUsr);
                    this.userList.sort(this.compareByUsername);
                  }
                }
              }

              for (let user of this.userList) {
                let flag = 0;
                for (let liveUser of users) {
                  if (liveUser.username == user.username) {
                    user.online = true;
                    flag = 1;
                    break;
                  }
                }
                if (flag == 0) {
                  user.online = false;
                }
              }

              this.currentOnline = this.checkOnline(this.chatWith);
            });

          this.chatService.getActiveList();
        } else {
          this.onNewConv("chat-room");
        }
      });
  }

  initReceivers(): void {
    this.getUserList();

    this.receiveMessageObs = this.chatService.receiveMessage()
      .subscribe(message => {
        this.checkMine(message);
        if (message.conversationId == this.conversationId) {
          this.noMsg = false;
          this.messageList.push(message);
          this.scrollToBottom();
          this.msgSound();
        } else if (message.mine != true) {
          if (this.notification.timeout) {clearTimeout(this.notification.timeout)};
          this.notification = {
            from: message.from,
            inChatRoom: message.inChatRoom,
            text: message.text,
            timeout: setTimeout(()=>{ this.notify = false }, 4000)
          };
          this.notify = true;
          this.notifSound();
        }
      });
  }

  onSendSubmit(): void {
    let newMessage: Message = {
      created: new Date(),
      from: this.username,
      text: this.sendForm.value.message,
      conversationId: this.conversationId,
      inChatRoom: this.chatWith == "chat-room"
    };

    //console.log(newMessage);
    this.chatService.sendMessage(newMessage, this.chatWith);
    newMessage.mine = true;
    this.noMsg = false;
    this.messageList.push(newMessage);
    this.scrollToBottom();
    this.msgSound();
    this.sendForm.setValue({message: ""});
  }

  checkMine(message: Message): void {
    if (message.from == this.username) {
      message.mine = true;
    }
  }

  onUsersClick(): void {
    this.showActive = !this.showActive;
  }

  onNewConv(username: string) {
    if (this.chatWith != username) {
      this.router.navigate(['/chat', username]);
      this.getMessages(username);
    } else {
      this.getMessages(username);
    }
    this.currentOnline = this.checkOnline(username);
    this.showActive = false;
  }

  notifSound(): void {
    let sound: any = this.el.nativeElement.querySelector('#notifSound');
    sound.play();
  }

  msgSound(): void {
    let sound: any = this.el.nativeElement.querySelector('#msgSound');
    sound.load();
    sound.play();
  }

  scrollToBottom(): void {
    if(this.state) {
      let element: any = this.el.nativeElement.querySelector('.msg-container');
      setTimeout(() => {
        element.scrollTop = element.scrollHeight;
      }, 100);
    }
  }

  checkOnline(name: string): boolean {
    if (name == "chat-room") {
      for (let user of this.userList) {
        if (user.online == true) {
          return true;
        }
      }
      return false;
    } else {
      for (let user of this.userList) {
        if (user.username == name) {
          return user.online;
        }
      }
    }
  }

  compareByUsername(a, b): number {
    if (a.username < b.username)
      return -1;
    if (a.username > b.username)
      return 1;
    return 0;
  }

}

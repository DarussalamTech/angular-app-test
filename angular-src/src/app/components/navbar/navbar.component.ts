import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from "../../services/auth.service";
import { ChatService } from "../../services/chat.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService,
    private el: ElementRef
  ) { }

  ngOnInit() {
  }

  onLogoutClick(userID: number): boolean {
    this.chatService.disconnect();
    let userData = this.authService.getUserData();
    this.authService.logout(userData.user.id).subscribe(data => {
        if (data.success == true) {
          this.router.navigate(["/login"]);
          this.onNavigate();
        }
    });
    return false;
  }

  onNavigate(): void {
    this.collaspseNav();
  }

  collaspseNav(): void {
    let butt = this.el.nativeElement.querySelector(".navbar-toggle");
    let isCollapsed = this.hasClass(butt, "collapsed");
    if (isCollapsed == false) {
      butt.click();
    }
  }

  hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }

}

import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
  userProfile: Object;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.userProfile  = this.authService.getUserData();
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { Message } from 'src/app/_models/message';
import { tap } from 'rxjs/operators';
import { MessagesComponent } from 'src/app/messages/messages.component';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @Input() recipientId: number;
  messages: Message[];
  newMessage: any = {};

  constructor(private userService: UserService , private authService: AuthService ,
    private alertify: AlertifyService) { }

  ngOnInit() {
    this.loadMessages();
  }

loadMessages() {
  const currentUserId = +this.authService.decodedToken.nameid;
  this.userService.getMesssageThread(this.authService.decodedToken.nameid , this.recipientId)
    .pipe(
      tap(mess => {
        for (let i = 0; i < mess.length; i++) {
          if (mess[i].isRead === false && mess[i].recipientId === currentUserId) {
            this.userService.markAsRead(currentUserId, mess[i].id);
          }
        }
      })
    )
    .subscribe(messages => {
      this.messages = messages;
  } , error => {
    this.alertify.error(error);
  });
}

sendMessage() {
  this.newMessage.recipientId = this.recipientId;
  this.userService.sendMessage(this.authService.decodedToken.nameid , this.newMessage)
  .subscribe((message: Message) => {
    this.messages.unshift(message);
    this.newMessage.content = '';
  },  error => {
    this.alertify.error(error);
  });
}

}

import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  emailAddress: string;
  firstName: string;

  showLoadingState = false;

  constructor(
    private afAuth: AngularFireAuth,
    private afFirestore: AngularFirestore
  ) {}

  async onCreateAccount() {
    try {
      this.showLoadingState = true;
      const userCred = await this.afAuth.auth.signInAnonymously();
      await this.afFirestore.doc(`users/${userCred.user.uid}`).set({
        emailAddress: this.emailAddress,
        firstName: this.firstName
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.showLoadingState = false;
    }
  }

  onSignOut() {
    this.afAuth.auth.signOut();
  }

  get allowAccountCreation() {
    return this.emailAddress && this.firstName && !this.afAuth.auth.currentUser;
  }

  get isUserLoggedIn() {
    return this.afAuth.auth.currentUser;
  }
}

import { LightningElement } from 'lwc';
import validateUser from '@salesforce/apex/LoginController.validateUser';
import { NavigationMixin } from 'lightning/navigation';


export default class LoginPage extends NavigationMixin(LightningElement) {
    // Declaring variables
    email = '';
    password = '';
    errorMessage = '';
    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
    }

    handleLogin() {
        validateUser({ email: this.email, password: this.password })
            .then(username  => {
                if (username) {
                    this.errorMessage = '';
    
                    // Store email and username in sessionStorage
                    sessionStorage.setItem('currentEmail', this.email);
                    sessionStorage.setItem('currentUser', username);
    
                    // Navigate to homepage
                    this[NavigationMixin.Navigate]({
                        type: 'standard__webPage',
                        attributes: {
                            url: '/home'
                        }
                    });
                } else {
                    this.errorMessage = 'Invalid email or password';
                }
            })
            .catch(error => {
                this.errorMessage = 'Error: ' + (error?.body?.message || error.message);
            });
    }
}
import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class SiteHeader extends NavigationMixin(LightningElement) {
        username = '';
    
        renderedCallback() {
            const storedUser = sessionStorage.getItem('currentUser');
            if (storedUser && storedUser !== this.username) {
                this.username = storedUser;
            }
        }

    handleLogout() {

        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/MySalesforceApp/'
            }
        });
    }
}
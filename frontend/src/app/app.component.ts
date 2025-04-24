// import { Component } from '@angular/core';
// import { ButtonModule } from 'primeng/button';
// import { CommonModule } from '@angular/common';

// @Component({
//     selector: 'app-root',
//     standalone: true,
//     imports: [CommonModule, ButtonModule],
//     template: `
//         <p-button label="Click me" severity="success"></p-button>
//     `
// })
// export class AppComponent {
//     title = 'frontend';
// }
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    template: `
        <div style="padding: 2rem; display: flex; gap: 1rem; flex-direction: column">
            <div>
                <p-button label="Primary"></p-button>
                <p-button label="Secondary" severity="secondary"></p-button>
                <p-button label="Success" severity="success"></p-button>
                <p-button label="Info" severity="info"></p-button>
                <p-button label="Help" severity="help"></p-button>
                <p-button label="Danger" severity="danger"></p-button>
            </div>
            
            <div>
                <p-button label="Raised" raised></p-button>
                <p-button label="Rounded" rounded></p-button>
                <p-button label="Text" text></p-button>
                <p-button label="Outlined" outlined></p-button>
            </div>
        </div>
    `
})
export class AppComponent {
    title = 'frontend';
}
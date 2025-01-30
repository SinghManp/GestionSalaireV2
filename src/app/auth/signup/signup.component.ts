import {Component, OnInit} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from 'src/app/services/auth.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
    signUpForm!: FormGroup;
    errorMessage: string = '';

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.signUpForm = this.formBuilder.group(
            {
                team: ['', [Validators.required]],
                name: ['', [Validators.required]],
                email: ['', [Validators.required, Validators.email]],
                password: [
                    '',
                    [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)],
                ],
                passwordCheck: [
                    '',
                    [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)],
                ],
                role: ['', [Validators.required]],
            },
            {validators: this.passwordsMatch}
        );
    }

    passwordsMatch(control: AbstractControl): { [key: string]: boolean } | null {
        const password = control.get('password');
        const passwordCheck = control.get('passwordCheck');

        if (!password || !passwordCheck) {
            return null;
        }

        return password.value === passwordCheck.value ? null : {mismatch: true};
    }

    onSubmit() {
        const email = this.signUpForm.get('email')?.value;
        const password = this.signUpForm.get('password')?.value;
        const name = this.signUpForm.get('name')?.value;
        const team = this.signUpForm.get('team')?.value;
        const role = this.signUpForm.get('role')?.value;
        this.authService.createNewUser(email, password, name, team, role).then(
            () => {
                this.router.navigate(['/semaine']);
            },
            (error) => {
                this.errorMessage = error;
            }
        );
    }

    test() {
        this.authService
            .getTeamIdByName(this.signUpForm.get('team')?.value)
            .then((a: any) => {
                console.log('create team', a);
            });
    }
}

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: process.env.GOOGLE_REDIRECT_URL, // e.g. https://api.example.com/auth/google/redirect
            scope: ['profile', 'email'],
        } as any);
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile) {
        const { name, emails } = profile;
        if (!emails || emails.length === 0) throw new Error('No email found from Google account');

        return {
            email: emails[0].value,
            fullName: `${name?.givenName ?? ''} ${name?.familyName ?? ''}`.trim(),
            picture: profile.photos?.[0]?.value ?? null,
        };
    }
}

// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, Profile } from 'passport-google-oauth20';
// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

//     constructor() {
//         super({
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_SECRET,
//             callbackURL: process.env.GOOGLE_REDIRECT_URL || "http://localhost:3064/auth/google/redirect",
//             scope: ['profile', 'email'],
//         } as any); // <-- forces StrategyOptions overload, fixes TS error
//     }

//     async validate(
//         accessToken: string,
//         refreshToken: string,
//         profile: Profile,
//     ) {
//         const { name, emails } = profile;

//         if (!emails || emails.length === 0) {
//             throw new Error('No email found from Google account');
//         }

//         return {
//             email: emails[0].value,
//             fullName: `${name?.givenName ?? ''} ${name?.familyName ?? ''}`.trim(),
//             picture: profile.photos?.[0]?.value ?? null,
//         };
//     }

// }

// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, VerifyCallback } from 'passport-google-oauth20';
// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

//   constructor() {
//     super({
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_SECRET,
//       callbackURL: process.env.GOOGLE_REDIRECT_URL,
//       scope: ['profile', 'email'],
//     });
//   }

//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     profile: any,
//     done: VerifyCallback,
//   ): Promise<any> {

//     const { name, emails, photos } = profile;

//     const user = {
//       email: emails[0].value,
//       fullName: `${name.givenName} ${name.familyName}`,
//       picture: photos[0].value,
//     };

//     done(null, user);
//   }
// }

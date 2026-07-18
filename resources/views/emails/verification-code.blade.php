<x-mail::message>
# Verify your email address

Hi {{ $name }},

Thanks for signing up. Use the verification code below to confirm your email address. This code expires in 15 minutes.

<x-mail::panel>
# {{ $code }}
</x-mail::panel>

If you didn't create an account, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

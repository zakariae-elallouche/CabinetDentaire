<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; padding: 32px;">
    <h2>Réinitialisation de mot de passe</h2>
    <p>Bonjour,</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
    <p>
        <a href="{{ $resetUrl }}"
           style="display: inline-block; padding: 12px 24px; background: #0f4842;
                  color: #fff; text-decoration: none; border-radius: 8px;">
            Réinitialiser mon mot de passe
        </a>
    </p>
    <p style="color: #7d8682; font-size: 13px;">
        Ce lien expire dans 60 minutes.<br>
        Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
    </p>
</body>
</html>

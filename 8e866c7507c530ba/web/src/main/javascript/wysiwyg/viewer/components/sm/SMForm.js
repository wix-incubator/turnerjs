/** @type wysiwyg.viewer.components.sm.SMForm */
define.component('wysiwyg.viewer.components.sm.SMForm', function(componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition ;

    def.inherits('mobile.core.components.base.BaseComponent') ;

    def.resources(['W.Data']) ;

    def.binds(['_onFormError', '_onFormSuccess']) ;

    def.statics({
        PASS_MIN_LEN: 4,
        PASS_MAX_LEN: 15,
        ERR_MAP: { //TODO: replace with Viewer translation mechanism one day
            'GENERAL_ERR': 'Server error. try again later.',
            'VAL_ERR_PASSWORD_BLANK': 'Password cannot be blank',
            'VAL_ERR_PASSWORD_RETYPE': 'Passwords are not the same',
            'VAL_ERR_PASSWORD_LENGTH': 'Password length must be between {0} and {1}',
            'VAL_ERR_EMAIL_BLANK': 'Email cannot be blank',
            'VAL_ERR_EMAIL_INVALID': 'Email is invalid',
            'VAL_ERR_NON_ASCII_CHARS': 'Password must contain only ASCII characters',
            '-19999': 'Unknown user', //SITE_MEMBER_NOT_FOUND
            '-19995': 'Email is already taken', //EMAIL_TAKEN
            '-19972': 'Invalid token', //FORGOT_PASSWORD_TOKEN_INVALID
            '-19988': 'Validation Error', //SM_VALIDATION_ERROR
            '-19984': "Invalid Session", //INVALID_SM_SESSION
            '-19976': "Wrong email or password", //AUTHENTICATION_FAILED
            '-19958': "Your member request is waiting approval from the site owner", //PENDING_APPROVAL.
            '-19980': "Blocked by site owner"
        },
        INTENTS: {
            LOGIN: "LOGIN",
            REGISTER: "REGISTER",
            UPDATE_USER: "UPDATE",
            EMAIL_RESET_PASSWORD: "EMAILRESETPASSWORD",
            RESET_PASSWORD: "RESETPASSWORD"
        },
        LABELS: {
            EMAIL: "Email",
            PASSWORD: "Password",
            RE_PASSWORD: "Retype password",
            REMEMBER_ME: "Remember Me"
        },
        langKeys: {
            en: {
                "SMRegister_sign_up": "Sign up",
                "SMRegister_GO": "GO",
                "SMRegister_Already_Have_User":"I'm already a user",
                "SMRegister_Login":"Login",
                "SMForm_Email": "Email",
                "SMForm_Password": "Password",
                "SMForm_Retype_Password":"Retype password",
                "SMLogin_Remember_Me":"Remember Me",
                "SMLogin_Forgot_Password": "Forgot your password?",
                "SMLogin_Login":"Login",
                "SMLogin_Sign_UP":"Or {0}Sign up{1}",
                "SMResetPassMail_title":"Reset Password",
                "SMResetPassMail_Back_Login": "Back to Login",
                "SMResetPassMail_Enter_Email": "Please enter your email address",
                "SMResetPassMail_confirmation_title": "Please check your email",
                "SMResetPassMail_confirmation_msg":"We’ve sent you an email with a link that will allow you to reset your password",
                "SMResetPass_Message":"To set your new password, please enter it in both fields below. ",
                "SMResetPass_New_Password":"Enter a new password",
                "SMResetPass_Retype_Password":"Type again:",
                "SMResetPass_Continue":"Continue",
                "SMResetPass_Reset_Succ":"You’ve successfully reset your password.",
                "SMResetPass_Reset_Fail":"Password could not have been changed. Try again later.",
                "SMProfile_Update_Details":"Update your details",
                "SMProfile_Update":"Update",
                "SMApply_Success1":"Success! Your member login request has been sent and is awaiting approval.",
                "SMApply_Success2":"The site administrator will notify you via email( {0} ) once your request has been approved ",
                'SMForm_Error_General_Err': 'Server error. try again later.',
                'SMForm_Error_Password_Blank': 'Password cannot be blank',
                'SMForm_Error_Password_Retype': 'Passwords are not the same',
                'SMForm_Error_Password_Length': 'Password length must be between {0} and {1}',
                'SMForm_Error_Email_Blank': 'Email cannot be blank',
                'SMForm_Error_Email_Invalid': 'Email is invalid',
                'SMForm_Error_Non_Ascii_Chars': 'Password must contain only ASCII characters',
                'SMForm_Error_19999': 'Unknown user', //SITE_MEMBER_NOT_FOUND
                'SMForm_Error_19995': 'Email is already taken', //EMAIL_TAKEN
                'SMForm_Error_19972': 'Invalid token', //FORGOT_PASSWORD_TOKEN_INVALID
                'SMForm_Error_19988': 'Validation Error', //SM_VALIDATION_ERROR
                'SMForm_Error_19984': "Invalid Session", //INVALID_SM_SESSION
                'SMForm_Error_19976': "Wrong email or password", //AUTHENTICATION_FAILED
                'SMForm_Error_19958': "Your member request is waiting approval from the site owner", //PENDING_APPROVAL.
                'SMForm_Error_19980': "Blocked by site owner"



            },
            es: {
                "SMRegister_sign_up": "Regístrate",
                "SMRegister_GO": "ENTRAR",
                "SMRegister_Already_Have_User": "Ya soy un usuario",
                "SMRegister_Login":"Inicia Sesión",
                "SMForm_Email": "Email",
                "SMForm_Password": "Clave",
                "SMForm_Retype_Password":"Escribe de nuevo la clave",
                "SMLogin_Remember_Me":"Recuérdame",
                "SMLogin_Forgot_Password": "¿Has olvidado tu clave?",
                "SMLogin_Login":"Inicia sesión",
                "SMLogin_Sign_UP":"O {0}Regístrate{1}",
                "SMResetPassMail_title":"Restablecer Clave",
                "SMResetPassMail_Back_Login": "Volver a Iniciar Sesión",
                "SMResetPassMail_Enter_Email": "Por favor escribe tu dirección de correo",
                "SMResetPassMail_confirmation_title": "Por favor revisa tu correo",
                "SMResetPassMail_confirmation_msg":"Te hemos enviado un email con un enlace que te permitirá restablecer tu clave",
                "SMResetPass_Message":"Para configurar tu nueva clave, por favor rellena ambos campos a continuación. ",
                "SMResetPass_New_Password":"Escribe una nueva clave",
                "SMResetPass_Retype_Password":"Escríbela de nuevo:",
                "SMResetPass_Continue":"Continuar",
                "SMResetPass_Reset_Succ":"¡Has restablecido tu clave con éxito!",
                "SMResetPass_Reset_Fail":"La clave no se pudo cambiar. Inténtalo de nuevo más tarde.",
                "SMProfile_Update_Details":"Update your details",
                "SMProfile_Update":"Update",
                "SMApply_Success1":"¡Enhorabuena! Tu solicitud de login de miembros ha sido enviada y está pendiente de aprobación.",
                "SMApply_Success2":"El administrador del sitio te notificará a través de un email ( {0} una vez tu solicitud sea aprobada ",
                'SMForm_Error_General_Err': 'Error del servidor. inténtalo de nuevo más tarde.',
                'SMForm_Error_Password_Blank': 'El campo de la clave no puede estar en blanco',
                'SMForm_Error_Password_Retype': 'Las claves no son las mismas',
                'SMForm_Error_Password_Length': 'La longitud de la clave debe ser entre {0} y {1}',
                'SMForm_Error_Email_Blank': 'El campo del email no puede estar en blanco',
                'SMForm_Error_Email_Invalid': 'Email inválido',
                'SMForm_Error_Non_Ascii_Chars': 'La clave debe contener sólo caracteres ASCII',
                'SMForm_Error_19999': 'Usuario desconocido', //SITE_MEMBER_NOT_FOUND
                'SMForm_Error_19995': 'Este email ya está siendo usado', //EMAIL_TAKEN
                'SMForm_Error_19972': 'Token inválido', //FORGOT_PASSWORD_TOKEN_INVALID
                'SMForm_Error_19988': 'Error de Validación', //SM_VALIDATION_ERROR
                'SMForm_Error_19984': "Sesión Inválida", //INVALID_SM_SESSION
                'SMForm_Error_19976': "Email o clave incorrecto/a", //AUTHENTICATION_FAILED
                'SMForm_Error_19958': "La solicitud de miembro está a la espera de la aprobación por parte del dueño del sitio.", //PENDING_APPROVAL.
                'SMForm_Error_19980': "Bloqueado por el dueño del sitio"
            },
            de: {
                "SMRegister_sign_up": "Registrieren",
                "SMRegister_GO": "Los",
                "SMRegister_Already_Have_User": "Ich bin bereits Nutzer",
                "SMRegister_Login":"Anmelden",
                "SMForm_Email": "E-Mail-Adresse",
                "SMForm_Password": "Passwort",
                "SMForm_Retype_Password":"Passwort erneut eingeben",
                "SMLogin_Remember_Me":"Angemeldet bleiben",
                "SMLogin_Forgot_Password": "Passwort vergessen?",
                "SMLogin_Login":"Anmelden",
                "SMLogin_Sign_UP":"Oder {0}registrieren{1}",
                "SMResetPassMail_title":"Passwort zurücksetzen",
                "SMResetPassMail_Back_Login": "Zurück zur Anmeldung",
                "SMResetPassMail_Enter_Email": "Bitte geben Sie Ihre E-Mail-Adresse ein.",
                "SMResetPassMail_confirmation_title": "Bitte prüfen Sie Ihren Posteingang.",
                "SMResetPassMail_confirmation_msg":"Wir haben Ihnen eine E-Mail mit einem Link geschickt, der es Ihnen ermöglicht Ihr Passwort zurückzusetzen.",
                "SMResetPass_Message":"Bitte füllen Sie beide Felder unten aus, um ein neues Passwort festzulegen. ",
                "SMResetPass_New_Password":"Neues Passwort eingeben",
                "SMResetPass_Retype_Password":"Erneut eingeben:",
                "SMResetPass_Continue":"Fortfahren",
                "SMResetPass_Reset_Succ":"Sie haben Ihr Passwort erfolgreich zurückgesetzt.",
                "SMResetPass_Reset_Fail":"Passwort konnte nicht geändert werden. Probieren Sie es später nochmal.",
                "SMProfile_Update_Details":"Update your details",
                "SMProfile_Update":"Update",
                "SMApply_Success1":"Vielen Dank! Ihre Anfrage zur Mitgliederanmeldung wurde versandt und wartet auf Bestätigung.",
                "SMApply_Success2":"Der Administrator der Website wird Sie per E-Mail informieren, ( {0} ) sobald Ihre Anfrage bestätigt wurde.  ",
                'SMForm_Error_General_Err': 'Serverfehler. Versuchen Sie es später nochmal.',
                'SMForm_Error_Password_Blank': 'Passwort kann nicht leer sein.',
                'SMForm_Error_Password_Retype': 'Passwörter stimmen nicht überein.',
                'SMForm_Error_Password_Length': 'Passwortlänge muss zwischen {0} und {1} sein.',
                'SMForm_Error_Email_Blank': 'E-Mail-Adresse kann nicht leer sein.',
                'SMForm_Error_Email_Invalid': 'Ungültige E-Mail-Adresse',
                'SMForm_Error_Non_Ascii_Chars': 'Passwort darf nur ASCII-Zeichen beinhalten.',
                'SMForm_Error_19999': 'Unbekannter Nutzer', //SITE_MEMBER_NOT_FOUND
                'SMForm_Error_19995': 'Diese E-Mail-Adresse existiert bereits.', //EMAIL_TAKEN
                'SMForm_Error_19972': 'Ungültiges Zeichen', //FORGOT_PASSWORD_TOKEN_INVALID
                'SMForm_Error_19988': 'Validierungsfehler', //SM_VALIDATION_ERROR
                'SMForm_Error_19984': "Ungültige Sitzung", //INVALID_SM_SESSION
                'SMForm_Error_19976': "Falsche E-Mail-Adresse oder Passwort.", //AUTHENTICATION_FAILED
                'SMForm_Error_19958': "Ihre Anfrage auf Mitgliedschaft wartet auf Bestätigung vom Betreiber der Website.", //PENDING_APPROVAL.
                'SMForm_Error_19980': "Vom Betreiber der Website geblockt"
            },
            fr: {
                "SMRegister_sign_up": "Inscription",
                "SMRegister_GO": "OK",
                "SMRegister_Already_Have_User": "Je suis déjà inscrit",
                "SMRegister_Login":"Connexion",
                "SMForm_Email": "Email",
                "SMForm_Password": "Mot de passe",
                "SMForm_Retype_Password":"Confirmez mot de passe",
                "SMLogin_Remember_Me":"Se Souvenir de Moi",
                "SMLogin_Forgot_Password": "Mot de passe oublié ?",
                "SMLogin_Login":"Connexion",
                "SMLogin_Sign_UP":"Ou {0}Inscrivez-vous{1}",
                "SMResetPassMail_title":"Réinitialiser Mot de Passe",
                "SMResetPassMail_Back_Login": "Retour à Connexion",
                "SMResetPassMail_Enter_Email": "Veuillez saisir votre adresse email",
                "SMResetPassMail_confirmation_title": "Veuillez vérifier vos emails",
                "SMResetPassMail_confirmation_msg":"Un email avec un lien pour réinitialiser votre mot de passe vous a été envoyé",
                "SMResetPass_Message":"Pour définir votre nouveau mot de passe, veuillez le saisir dans les champs ci-dessous. ",
                "SMResetPass_New_Password":"Saisissez un nouveau mot de passe",
                "SMResetPass_Retype_Password":"Confirmez le mot de passe :",
                "SMResetPass_Continue":"Continuer",
                "SMResetPass_Reset_Succ":"Vous avez réinitialisé votre mot de passe avec succès ",
                "SMResetPass_Reset_Fail":"Votre mot de passe n'a pas pu être modifié. Veuillez réessayer ultérieurement.",
                "SMProfile_Update_Details":"Update your details",
                "SMProfile_Update":"Update",
                "SMApply_Success1":"Bravo ! Votre demande de connexion membre a été envoyée et est en attente d'approbation.",
                "SMApply_Success2":"L'administrateur du site vous informera par email( {0} ) lorsque votre demande aura été approuvée ",
                'SMForm_Error_General_Err': 'Erreur de serveur. Veuillez réessayer plus tard.',
                'SMForm_Error_Password_Blank': 'Veuillez saisir le mot de passe',
                'SMForm_Error_Password_Retype': 'Les mots de passe ne sont pas identiques',
                'SMForm_Error_Password_Length': 'La longueur du mot de passe doit être entre {0} et {1}',
                'SMForm_Error_Email_Blank': "Veuillez saisir l'Email",
                'SMForm_Error_Email_Invalid': 'Email invalide',
                'SMForm_Error_Non_Ascii_Chars': 'Le mot de passe doit contenir uniquement des caractères ASCII',
                'SMForm_Error_19999': 'Utilisateur inconnu', //SITE_MEMBER_NOT_FOUND
                'SMForm_Error_19995': 'Cet email est déjà utilisé', //EMAIL_TAKEN
                'SMForm_Error_19972': 'Token invalide', //FORGOT_PASSWORD_TOKEN_INVALID
                'SMForm_Error_19988': 'Erreur Validation', //SM_VALIDATION_ERROR
                'SMForm_Error_19984': "Session Invalide", //INVALID_SM_SESSION
                'SMForm_Error_19976': "L' email ou le mot de passe est incorrect", //AUTHENTICATION_FAILED
                'SMForm_Error_19958': "Votre demande est en attente d'approbation du propriétaire du site", //PENDING_APPROVAL.
                'SMForm_Error_19980': "Bloqué par le propriètaire du site"
            },
            it: {
                "SMRegister_sign_up": "Iscriviti",
                "SMRegister_GO": "VAI",
                "SMRegister_Already_Have_User": "Sono un utente esistente",
                "SMRegister_Login":"Login",
                "SMForm_Email": "Email",
                "SMForm_Password": "Password",
                "SMForm_Retype_Password":"Digita nuovamente la password",
                "SMLogin_Remember_Me":"Ricordami",
                "SMLogin_Forgot_Password": "Hai dimenticato la tua password?",
                "SMLogin_Login":"Login",
                "SMLogin_Sign_UP":"Oppure {0}Iscriviti{1}",
                "SMResetPassMail_title":"Ripristina Password",
                "SMResetPassMail_Back_Login": "Torna al Login",
                "SMResetPassMail_Enter_Email": "Ti preghiamo di inserire il tuo indirizzo email",
                "SMResetPassMail_confirmation_title": "Ti preghiamo di controllare la tua email",
                "SMResetPassMail_confirmation_msg":"Ti abbiamo inviato un'email con un link che ti permetterà di ripristinare la tua password",
                "SMResetPass_Message":"Per impostare la tua nuova password, inseriscila per cortesia in entrambi i campi qui sotto. ",
                "SMResetPass_New_Password":"Inserisci una nuova password",
                "SMResetPass_Retype_Password":"Digita nuovamente:",
                "SMResetPass_Continue":"Continua",
                "SMResetPass_Reset_Succ":"Hai ripristinato con successo la tua password.",
                "SMResetPass_Reset_Fail":"Non è stato possibile modificare la password. Prova nuovamente più tardi.",
                "SMProfile_Update_Details":"Update your details",
                "SMProfile_Update":"Update",
                "SMApply_Success1":"Successo! La tua richiesta di login membro è stata inviata ed è in attesa di approvazione.",
                "SMApply_Success2":"L'amministratore del sito ti notificherà via email( {0} ) una volta che la tua richiesta è stata accettata ",
                'SMForm_Error_General_Err': 'Errore del server. Prova nuovamente più tardi.',
                'SMForm_Error_Password_Blank': 'Il campo Password non può essere lasciato in bianco',
                'SMForm_Error_Password_Retype': 'Le password non sono uguali',
                'SMForm_Error_Password_Length': "La lunghezza della password dev'essere compresa tra {0} e {1}",
                'SMForm_Error_Email_Blank': 'Il campo Email non può essere lasciato in bianco',
                'SMForm_Error_Email_Invalid': "L'Email non è valida",
                'SMForm_Error_Non_Ascii_Chars': "La password deve contenere solo caratteri ASCII",
                'SMForm_Error_19999': "Utente sconosciuto", //SITE_MEMBER_NOT_FOUND
                'SMForm_Error_19995': "L'Email è già in utilizzo", //EMAIL_TAKEN
                'SMForm_Error_19972': "Token non valido", //FORGOT_PASSWORD_TOKEN_INVALID
                'SMForm_Error_19988': "Errore di Convalida", //SM_VALIDATION_ERROR
                'SMForm_Error_19984': "Sessione non valida", //INVALID_SM_SESSION
                'SMForm_Error_19976': "Email o password non corretta", //AUTHENTICATION_FAILED
                'SMForm_Error_19958': "La tua richiesta membro è in attesa di approvazione da parte per proprietario del sito", //PENDING_APPROVAL.
                'SMForm_Error_19980': "Bloccato dal proprietario del sito"
            },
            ja: {
                "SMRegister_sign_up": "新規登録",
                "SMRegister_GO": "GO",
                "SMRegister_Already_Have_User": "メンバーの方はこちらから",
                "SMRegister_Login":"ログイン",
                "SMForm_Email": "メールアドレス",
                "SMForm_Password": "パスワード",
                "SMForm_Retype_Password":"パスワードを再入力してください",
                "SMLogin_Remember_Me":"ログインしたままにする",
                "SMLogin_Forgot_Password": "パスワードを忘れた",
                "SMLogin_Login":"ログイン",
                "SMLogin_Sign_UP":"／ {0}新規登録{1}",
                "SMResetPassMail_title":"パスワードの再設定",
                "SMResetPassMail_Back_Login": "ログインに戻る",
                "SMResetPassMail_Enter_Email": "メールアドレスを入力してください",
                "SMResetPassMail_confirmation_title": "パスワードリセットのご案内メールを　　お送りしました",
                "SMResetPassMail_confirmation_msg":"パスワードの再設定に関するメールを送信しました。メールの本文に含まれているリンクをクリックしてください。",
                "SMResetPass_Message":"この画面上でパスワードを再設定します",
                "SMResetPass_New_Password":"新しいパスワードを入力してください",
                "SMResetPass_Retype_Password":"再入力してください",
                "SMResetPass_Continue":"続行",
                "SMResetPass_Reset_Succ":"パスワードの再設定ができました",
                "SMResetPass_Reset_Fail":"パスワードが変更できませんでした。再実行してください。",
                "SMProfile_Update_Details":"Update your details",
                "SMProfile_Update":"Update",
                "SMApply_Success1":"会員登録リクエストが無事送信されました。",
                "SMApply_Success2":"会員登録が承認されると、ウェウサイト管理者からお知らせメールが（ {0} ）に送信されます。 ",
                'SMForm_Error_General_Err': "サーバーエラーが発生しました。再実行してください。",
                'SMForm_Error_Password_Blank': "パスワードは入力必須項目です",
                'SMForm_Error_Password_Retype': "パスワードが一致しません",
                'SMForm_Error_Password_Length': "パスワードは{0}文字以上 {1}文字以下で設定してください",
                'SMForm_Error_Email_Blank': "メールアドレスは入力必須項目です",
                'SMForm_Error_Email_Invalid': "無効なメールアドレスです",
                'SMForm_Error_Non_Ascii_Chars': "パスワードにはASCII（アスキー）文字のみ使用してください",
                'SMForm_Error_19999': "このメールアドレスに該当する登録はありません",
                'SMForm_Error_19995': "このメールアドレスは既に登録されています",
                'SMForm_Error_19972': "無効なトークンです",
                'SMForm_Error_19988': "検証エラー",
                'SMForm_Error_19984': "無効なセッションです",
                'SMForm_Error_19976': "メールアドレスまたはパスワードが正しくありません",
                'SMForm_Error_19958': "あなたの会員登録はウェブサイト管理者の承認待ちです",
                'SMForm_Error_19980':"ウェブサイト管理者からブロックされています"
            },
            ko: {
                "SMRegister_sign_up": "가입하기",
                "SMRegister_GO": "시작하기",
                "SMRegister_Already_Have_User": "사이트 회원 로그인",
                "SMRegister_Login": "로그인",
                "SMForm_Email": "이메일",
                "SMForm_Password": "비밀번호",
                "SMForm_Retype_Password": "비밀번호 확인",
                "SMLogin_Remember_Me": "내 계정 기억하기",
                "SMLogin_Forgot_Password": "비밀번호 찾기",
                "SMLogin_Login": "로그인",
                "SMLogin_Sign_UP": "또는 {0}가입하기{1}",
                "SMResetPassMail_title": "비밀번호 재설정",
                "SMResetPassMail_Back_Login": "로그인으로 돌아가기",
                "SMResetPassMail_Enter_Email": "이메일 주소를 입력하세요.",
                "SMResetPassMail_confirmation_title": "이메일을 확인해 주세요.",
                "SMResetPassMail_confirmation_msg": "비밀번호 재설정 링크가 이메일로 발송되었습니다.",
                "SMResetPass_Message": "새 비밀번호를 설정하려면 다음을 입력해 주세요.",
                "SMResetPass_New_Password": "새로운 비밀번호",
                "SMResetPass_Retype_Password": "비밀번호 확인",
                "SMResetPass_Continue": "계속",
                "SMResetPass_Reset_Succ": "비밀번호가 성공적으로 변경되었습니다.",
                "SMResetPass_Reset_Fail": "비밀번호를 변경할 수 없습니다. 잠시후에 다시 시도하세요.",
                "SMProfile_Update_Details": "Update your details",
                "SMProfile_Update": "Update",
                "SMApply_Success1": "성공적으로 회원가입 요청이 이루어졌습니다! 현재 회원가입 승인을 기다리고  있습니다.",
                "SMApply_Success2": "회원가입이 승인되면 이메일로 알려드립니다. ",
                "SMForm_Error_General_Err": "서버 오류입니다. 잠시 후 다시 시도하세요.",
                "SMForm_Error_Password_Blank": "비밀번호는 비워둘 수 없습니다.",
                "SMForm_Error_Password_Retype": "비밀번호를 다시 입력해 주세요.",
                "SMForm_Error_Password_Length": "비밀번호는 {0}자 이상 {1}자 이하이어야 합니다.",
                "SMForm_Error_Email_Blank": "이메일은 비워둘 수 없습니다.",
                "SMForm_Error_Email_Invalid": "유효하지 않은 이메일 주소입니다.",
                "SMForm_Error_Non_Ascii_Chars": "비밀번호는 반드시 ASCII 문자를 포함해야합니다.",
                "SMForm_Error_19999": "알 수 없는 사용자입니다.",
                "SMForm_Error_19995": "이미 존재하는 이메일입니다.",
                "SMForm_Error_19972": "유효하지 않은 토큰입니다.",
                "SMForm_Error_19988": "유효성 검사 오류",
                "SMForm_Error_19984": "유효하지 않은 세션입니다.",
                "SMForm_Error_19976": "잘못된 이메일 또는 비밀번호입니다.",
                "SMForm_Error_19958": "사이트 소유자의 회원요청 승인을 기다리고 있습니다.",
                "SMForm_Error_19980": "사이트 소유자에 의해 차단되었습니다."
            },
            pl: {
                "SMRegister_sign_up": "Zarejestruj sie",
                "SMRegister_GO": "START",
                "SMRegister_Already_Have_User": "Już jestem użytkownikiem",
                "SMRegister_Login":"Zaloguj sie",
                "SMForm_Email": "Email",
                "SMForm_Password": "Haslo",
                "SMForm_Retype_Password":"Powtórz haslo",
                "SMLogin_Remember_Me":"Zapamietaj mnie",
                "SMLogin_Forgot_Password": "Zapomniales hasla?",
                "SMLogin_Login":"Login",
                "SMLogin_Sign_UP":"Lub {0}Zarejestruj sie{1}",
                "SMResetPassMail_title":"Zresetuj Haslo",
                "SMResetPassMail_Back_Login": "Powrót do Loginu",
                "SMResetPassMail_Enter_Email": "Wpisz swój adres email",
                "SMResetPassMail_confirmation_title": "Sprawdz swój email",
                "SMResetPassMail_confirmation_msg":"Wyslalismy email z linkiem, który umozliwi ci zresetowanie hasla",
                "SMResetPass_Message":"Aby skonfigurowac twoje nowe haslo, wpisz je w obu polach ponizej. ",
                "SMResetPass_New_Password":"Wpisz nowe haslo",
                "SMResetPass_Retype_Password":"Wpisz ponownie:",
                "SMResetPass_Continue":"Kontynuuj",
                "SMResetPass_Reset_Succ":"Zresetowanie hasla powiodlo sie.",
                "SMResetPass_Reset_Fail":"Haslo nie moglo zostac zmienione. Spróbuj ponownie pózniej.",
                "SMProfile_Update_Details":"Update your details",
                "SMProfile_Update":"Update",
                "SMApply_Success1":"Sukces! Prosba o login witryny zostala wyslana i czeka na potwierdzenie.",
                "SMApply_Success2":"Administrator powiadomi cie w emailu,( {0} ) gdy twoja prosba zostanie zatwierdzona ",
                'SMForm_Error_General_Err': 'Blad serwera. Spróbuj ponownie pózniej.',
                'SMForm_Error_Password_Blank': 'Pole Haslo nie moze byc puste',
                'SMForm_Error_Password_Retype': 'Hasla róznia sie',
                'SMForm_Error_Password_Length': 'Dlugosc hasla musi wynosic pomiedzy {0}, a {1}',
                'SMForm_Error_Email_Blank': 'Pole Email nie moze byc puste',
                'SMForm_Error_Email_Invalid': 'Nieprawidlowy Email',
                'SMForm_Error_Non_Ascii_Chars': 'Haslo moze zawierac tylko znaki ASCII',
                'SMForm_Error_19999': 'Nierozpoznany uzytkownik', //SITE_MEMBER_NOT_FOUND
                'SMForm_Error_19995': 'Email juz istnieje', //EMAIL_TAKEN
                'SMForm_Error_19972': 'Bledny zeton', //FORGOT_PASSWORD_TOKEN_INVALID
                'SMForm_Error_19988': 'Blad Walidacji', //SM_VALIDATION_ERROR
                'SMForm_Error_19984': "Bledna Sesja", //INVALID_SM_SESSION
                'SMForm_Error_19976': "Niepoprawny email lub haslo", //AUTHENTICATION_FAILED
                'SMForm_Error_19958': "Twoja prosba o login witryny czeka na zatwierdzenie od wlasciciela witryny", //PENDING_APPROVAL.
                'SMForm_Error_19980': "Zablokowane przez wlasciciela witryny"
            },
            pt: {
                "SMRegister_sign_up": "Registre-se",
                "SMRegister_GO": "VÁ",
                "SMRegister_Already_Have_User": "Já sou um usuário",
                "SMRegister_Login":"Login",
                "SMForm_Email": "E-mail",
                "SMForm_Password": "Senha",
                "SMForm_Retype_Password":"Digite sua senha novamente",
                "SMLogin_Remember_Me":"Lembre-se de Mim",
                "SMLogin_Forgot_Password": "Esqueceu sua senha?",
                "SMLogin_Login":"Login",
                "SMLogin_Sign_UP":"Ou {0}Registre-se{1}",
                "SMResetPassMail_title":"Redefinir Senha",
                "SMResetPassMail_Back_Login": "Voltar para Login",
                "SMResetPassMail_Enter_Email": "Por favor, insira seu endereço de e-mail",
                "SMResetPassMail_confirmation_title": "Por favor, verifique seu e-mail",
                "SMResetPassMail_confirmation_msg":"Enviamos um e-mail com um link que lhe permitirá redefinir sua senha",
                "SMResetPass_Message":"Para definir sua nova senha, por favor, digite-a nos dois campos abaixo: ",
                "SMResetPass_New_Password":"Insira uma nova senha",
                "SMResetPass_Retype_Password":"Digite novamente:",
                "SMResetPass_Continue":"Continuar",
                "SMResetPass_Reset_Succ":"Você redefiniu sua senha com sucesso.",
                "SMResetPass_Reset_Fail":"Não foi possível alterar a senha. Tente novamente mais tarde.",
                "SMProfile_Update_Details":"Update your details",
                "SMProfile_Update":"Update",
                "SMApply_Success1":"Sucesso! Seu pedido de login foi enviado e aguarda aprovação.",
                "SMApply_Success2":"O administrador do site irá enviar-lhe uma notificação via e-mail( {0} ) assim que o pedido for aprovado ",
                'SMForm_Error_General_Err': 'Erro de servidor. tente novamente mais tarde.',
                'SMForm_Error_Password_Blank': 'Campo senha não pode estar vazio',
                'SMForm_Error_Password_Retype': 'Senhas não correspondem',
                'SMForm_Error_Password_Length': 'Senha deve ter entre {0} e {1} caracteres',
                'SMForm_Error_Email_Blank': 'Campo E-mail não pode estar vazio',
                'SMForm_Error_Email_Invalid': 'E-mail inválido',
                'SMForm_Error_Non_Ascii_Chars': 'A senha deve conter apenas caracteres ASCII',
                'SMForm_Error_19999': 'Usuário desconhecido', //SITE_MEMBER_NOT_FOUND
                'SMForm_Error_19995': 'E-mail já está sendo usado', //EMAIL_TAKEN
                'SMForm_Error_19972': 'Token Inválido', //FORGOT_PASSWORD_TOKEN_INVALID
                'SMForm_Error_19988': 'Erro de Validação', //SM_VALIDATION_ERROR
                'SMForm_Error_19984': "Sessão Inválida", //INVALID_SM_SESSION
                'SMForm_Error_19976': "E-mail ou senha incorreta", //AUTHENTICATION_FAILED
                'SMForm_Error_19958': "Seu pedido de login está aguardando a aprovação do proprietário do site", //PENDING_APPROVAL.
                'SMForm_Error_19980': "Bloqueado pelo proprietário do site"
            },
            ru: {
                "SMRegister_sign_up": "Зарегистрироваться",
                "SMRegister_GO": "ВПЕРЕД",
                "SMRegister_Already_Have_User": "Я уже зарегистрирован",
                "SMRegister_Login": "Войти",
                "SMForm_Email": "Email",
                "SMForm_Password": "Пароль",
                "SMForm_Retype_Password": "Повторите пароль",
                "SMLogin_Remember_Me": "Запомнить меня",
                "SMLogin_Forgot_Password": "Забыли пароль?",
                "SMLogin_Login": "Войти",
                "SMLogin_Sign_UP": "Или {0}Зарегистрируйтесь{1}",
                "SMResetPassMail_title": "Сбросить пароль",
                "SMResetPassMail_Back_Login": "Назад в логин",
                "SMResetPassMail_Enter_Email": "Пожалуйста, введите ваш email",
                "SMResetPassMail_confirmation_title": "Пожалуйста, проверьте ваш email",
                "SMResetPassMail_confirmation_msg": "Мы отправили вам на почту письмо со ссылкой для сброса пароля.",
                "SMResetPass_Message": "Введите ваш новый пароль ниже.",
                "SMResetPass_New_Password": "Новый пароль",
                "SMResetPass_Retype_Password": "Повторите пароль:",
                "SMResetPass_Continue": "Продолжить",
                "SMResetPass_Reset_Succ": "Вы успешно установили новый пароль.",
                "SMResetPass_Reset_Fail": "Не получилось изменить пароль. Попробуйте позже.",
                "SMProfile_Update_Details": "Update your details",
                "SMProfile_Update": "Update",
                "SMApply_Success1": "Поздравляем! Ваш запрос на регистрацию был отправлен на подтверждение.",
                "SMApply_Success2": "Администратор сайта пришлет вам письмо( {0} ), как только ваш запрос будет подтвержден ",
                "SMForm_Error_General_Err": "Ошибка сервера. Попробуйте позже.",
                "SMForm_Error_Password_Blank": "Недопустимый пароль",
                "SMForm_Error_Password_Retype": "Пароли не совпадают",
                "SMForm_Error_Password_Length": "Длина пароля должна быть от {0} до {1} знаков",
                "SMForm_Error_Email_Blank": "Недопустимый Email",
                "SMForm_Error_Email_Invalid": "Недопустимый Email",
                "SMForm_Error_Non_Ascii_Chars": "Пароль может содержать только ASCII символы",
                "SMForm_Error_19999": "Неизвестный пользователь",
                "SMForm_Error_19995": "Email уже зарегистрирован",
                "SMForm_Error_19972": "Неверный токен",
                "SMForm_Error_19988": "Ошибка валидации",
                "SMForm_Error_19984": "Неверная сессия",
                "SMForm_Error_19976": "Неверный email или пароль",
                "SMForm_Error_19958": "Запрос на регистрацию ожидает подтверждения владельца сайта.",
                "SMForm_Error_19980": "Заблокирован владельцем сайта"
            },


            nl: {

                "SMRegister_sign_up" : "Registreren",
                "SMRegister_GO" : "OK",
                "SMRegister_Already_Have_User" : "Ik ben al een gebruiker",
                "SMRegister_Login" : "Inloggen",


                "SMForm_Email" : "E-mailadres",
                "SMForm_Password" : "Wachtwoord",
                "SMForm_Retype_Password" : "Wachtwoord (bevestiging)",


                "SMLogin_Remember_Me" : "Gegevens onthouden",


                "SMLogin_Forgot_Password" : "Wachtwoord vergeten?",


                "SMLogin_Login" : "Inloggen",


                "SMLogin_Sign_UP" : "Of {0}registreer{1}",


                "SMResetPassMail_title" : "Wachtwoord opnieuw instellen",
                "SMResetPassMail_Enter_Email" : "Vul uw e-mailadres in",
                "SMResetPassMail_confirmation_title" : "Controleer uw e-mail",
                "SMResetPassMail_confirmation_msg" : "We hebben een e-mail verzonden met instructies over hoe u uw wachtwoord opnieuw kunt instellen.",


                "SMResetPass_Message" : "Vul hieronder uw nieuwe wachtwoord in.",
                "SMResetPass_New_Password" : "Vul een nieuw wachtwoord in",
                "SMResetPass_Retype_Password" : "Vul uw wachtwoord opnieuw in:",
                "SMResetPass_Continue" : "Doorgaan",
                "SMResetPass_Reset_Succ" : "Uw wachtwoord is opnieuw ingesteld.",
                "SMResetPass_Reset_Fail" : "Wachtwoord kan niet worden gewijzigd. Probeer het later opnieuw.",
                "SMResetPassMail_Back_Login" : "Terug naar inloggen",


                "SMProfile_Update_Details" : "Uw gegevens bijwerken",
                "SMProfile_Update" : "Opslaan",


                "SMApply_Success1" : "Gefeliciteerd! Uw inlogverzoek is verzonden en moet nu worden goedgekeurd.",
                "SMApply_Success2" : "De beheerder van de website stuurt u een e-mail ({0}) als uw verzoek is goedgekeurd. ",
                "SMApply_Success3" : ") once your request has been approved",



                "SMForm_Error_General_Err" : "Serverfout. Probeer het later opnieuw.",
                "SMForm_Error_Password_Blank" : "Wachtwoord mag niet leeg zijn",
                "SMForm_Error_Password_Retype" : "Wachtwoorden komen niet overeen",
                "SMForm_Error_Password_Length" : "Wachtwoord moet tussen {0} en {1} tekens lang zijn",
                "SMForm_Error_Email_Blank" : "E-mailadres mag niet leeg zijn",
                "SMForm_Error_Email_Invalid" : "E-mailadres is ongeldig",
                "SMForm_Error_Non_Ascii_Chars" : "Wachtwoord mag alleen ASCII-tekens bevatten",
                "SMForm_Error_19999" : "Onbekende gebruiker",
                "SMForm_Error_19995" : "E-mailadres is al in gebruik",
                "SMForm_Error_19972" : "Ongeldig token",
                "SMForm_Error_19988" : "Validatiefout",
                "SMForm_Error_19984" : "Ongeldige sessie",
                "SMForm_Error_19976" : "Onjuist e-mailadres of wachtwoord",
                "SMForm_Error_19958" : "Uw verzoek moet nu worden goedgekeurd door de eigenaar.",
                "SMForm_Error_19980" : "Geblokkeerd door eigenaar"
            },



            tr: {
                "SMRegister_sign_up": "Kaydol",
                "SMRegister_GO": "GIT",
                "SMRegister_Already_Have_User": "Zaten üyeyim",
                "SMRegister_Login":"Giris",
                "SMForm_Email": "E-posta",
                "SMForm_Password": "Sifre",
                "SMForm_Retype_Password":"Sifreyi yeniden yazin",
                "SMLogin_Remember_Me":"Beni hatirla",
                "SMLogin_Forgot_Password": "Sifrenizi unuttunuz mu?",
                "SMLogin_Login":"Giris",
                "SMLogin_Sign_UP":"Veya {0}Kaydolun{1}",
                "SMResetPassMail_title":"Sifreyi Sifirla",
                "SMResetPassMail_Back_Login": "Girişe Dön",
                "SMResetPassMail_Enter_Email": "Lütfen e-posta adresinizi girin",
                "SMResetPassMail_confirmation_title": "Lütfen e-postanizi kontrol edin",
                "SMResetPassMail_confirmation_msg":"Size sifrenizi sifirlamanizi saglayacak bir baglanti içeren bir e-posta gönderdik.",
                "SMResetPass_Message":"Yeni sifrenizi belirlemek için lütfen asagidaki iki alana da girin. ",
                "SMResetPass_New_Password":"Yeni bir sifre girin",
                "SMResetPass_Retype_Password":"Yeniden girin:",
                "SMResetPass_Continue":"Devam",
                "SMResetPass_Reset_Succ":"Sifrenizi yeniden ayarlama basarili.",
                "SMResetPass_Reset_Fail":"Sifre degistirilemedi. Daha sonra yeniden deneyin.",
                "SMProfile_Update_Details":"Update your details",
                "SMProfile_Update":"Update",
                "SMApply_Success1":"Basarili! Üye girisi talebiniz gönderildi ve onay bekliyor.",
                "SMApply_Success2":"Talebiniz onaylandiginda site yöneticisi size e-posta( {0} ) yoluyla bildirecektir ",
                'SMForm_Error_General_Err': 'Sunucu hatasi. Daha sonra yeniden deneyin.',
                'SMForm_Error_Password_Blank': 'Sifre bos olamaz',
                'SMForm_Error_Password_Retype': 'Sifreler ayni degil',
                'SMForm_Error_Password_Length': 'Sifre uzunlugu {0} ile {1} arasinda olmalidir',
                'SMForm_Error_Email_Blank': 'E-posta bos olamaz',
                'SMForm_Error_Email_Invalid': 'E-posta geçersiz',
                'SMForm_Error_Non_Ascii_Chars': 'Sifre sadece ASCII karakterleri içermelidir',
                'SMForm_Error_19999': 'Bilinmeyen kullanici', //SITE_MEMBER_NOT_FOUND
                'SMForm_Error_19995': 'E-posta halihazirda kullanimda', //EMAIL_TAKEN
                'SMForm_Error_19972': 'Geçersiz jeton', //FORGOT_PASSWORD_TOKEN_INVALID
                'SMForm_Error_19988': 'Dogrulama Hatasi', //SM_VALIDATION_ERROR
                'SMForm_Error_19984': "Geçersiz Oturum", //INVALID_SM_SESSION
                'SMForm_Error_19976': "Yanlis e-posta veya sifre", //AUTHENTICATION_FAILED
                'SMForm_Error_19958': "Üyelik talebiniz site sahibinden onay bekliyor", //PENDING_APPROVAL.
                'SMForm_Error_19980': "Site sahibi tarafindan bloke edildi"
            },

            sv: {


                "SMRegister_sign_up" : "registrera dig",
                "SMRegister_GO" : "KÖR",
                "SMRegister_Already_Have_User" : "Jag är redan en användare",
                "SMRegister_Login" : "Logga in",





                "SMForm_Email" : "E-post",

                "SMForm_Password" : "Lösenord",

                "SMForm_Retype_Password" : "Skriv in lösenord igen",


                "SMLogin_Remember_Me" : "Kom ihåg mig",
                "SMLogin_Forgot_Password" : "Glömt ditt lösenord?",
                "SMLogin_Login" : "Logga in",
                "SMLogin_Sign_UP" : "Eller {0}registrera dig{1}",
                "SMLogin_OR" : "Or",


                "SMResetPassMail_title" : "Återställ lösenord",
                "SMResetPassMail_Enter_Email" : "Skriv in din e-postadress",
                "SMResetPassMail_confirmation_title" : "Kolla din e-post",
                "SMResetPassMail_confirmation_msg" : "Vi har skickat en länk via e-post, genom vilken du kan återställa lösenordet",
                "SMResetPass_Message" : "Ange ett nytt lösenord genom att skriva in det i båda fälten nedan.",
                "SMResetPass_New_Password" : "Skriv in ett nytt lösenord",
                "SMResetPass_Retype_Password" : "Skriv in igen:",
                "SMResetPass_Continue" : "Fortsätt",
                "SMResetPass_Reset_Succ" : "Du har nu återställt lösenordet.",
                "SMResetPass_Reset_Fail" : "Lösenordet kunde inte ändras. Försök igen senare.",
                "SMResetPassMail_Back_Login" : "Tillbaka till inloggning",


                "SMProfile_Update_Details": "Update your details",
                "SMProfile_Update": "Update",


                "SMApply_Success1" : "Klart! Begäran om medlemsinloggning har skickats, och väntar på godkännande.",
                "SMApply_Success2" : "Webbplatsadministratören meddelar dig via e-post ({0}) när din begäran har godkänts ",
                "SMApply_Success3" : ") once your request has been approved",



                "SMForm_Error_General_Err" : "Serverfel. försök igen senare.",
                "SMForm_Error_Password_Blank" : "Lösenord kan inte vara tomt",
                "SMForm_Error_Password_Retype" : "Lösenorden stämmer inte överens",
                "SMForm_Error_Password_Length" : "Lösenordet längd måste vara mellan {0} och {1}",
                "SMForm_Error_Email_Blank" : "E-post kan inte vara tom",
                "SMForm_Error_Email_Invalid" : "E-posten är ogiltig",
                "SMForm_Error_Non_Ascii_Chars" : "Lösenordet får endast innehåll ASCII-tecken",
                "SMForm_Error_19999" : "Okänd användare",
                "SMForm_Error_19995" : "E-posten är upptagen",
                "SMForm_Error_19972" : "Ogiltig token",
                "SMForm_Error_19988" : "Verifieringsfel",
                "SMForm_Error_19984" : "Felaktig session",
                "SMForm_Error_19976" : "Fel e-post eller lösenord",
                "SMForm_Error_19958" : "Begäran om medlemsskap väntar på godkännande från sidans ägare",
                "SMForm_Error_19980" : "Blockerad av sidans ägare"



            },


            no: {

                "SMRegister_sign_up" : "Registrer deg",
                "SMRegister_GO" : "START",
                "SMRegister_Already_Have_User" : "Jeg er en eksisterende bruker",
                "SMRegister_Login" : "Logg på",


                "SMForm_Email" : "E-post",

                "SMForm_Password" : "Passord",

                "SMForm_Retype_Password" : "Bekreft passord",



                "SMLogin_Remember_Me" : "Husk meg",
                "SMLogin_Forgot_Password" : "Glemt passordet?",
                "SMLogin_Login" : "Logg på",
                "SMLogin_Sign_UP" : "eller {0}Registrer deg{1}",
                "SMLogin_OR" : "Or",


                "SMResetPassMail_title" : "Tilbakestill passordet",
                "SMResetPassMail_Enter_Email" : "Angi e-postadresse",
                "SMResetPassMail_confirmation_title" : "Sjekk e-posten din",
                "SMResetPassMail_confirmation_msg" : "Vi har sendt deg en e-post med en lenke for tilbakestilling av passordet.",
                "SMResetPass_Message" : "Skriv inn det nye passordet i begge feltene nedenfor.",
                "SMResetPass_New_Password" : "Angi nytt passord",
                "SMResetPass_Retype_Password" : "Bekreft passordet:",
                "SMResetPass_Continue" : "Fortsett",
                "SMResetPass_Reset_Succ" : "Passordet ditt ble tilbakestilt.",
                "SMResetPass_Reset_Fail" : "Passordet kunne ikke endres. Prøv igjen senere.",
                "SMResetPassMail_Back_Login" : "Tilbake til pålogging",


                "SMProfile_Update_Details": "Update your details",
                "SMProfile_Update": "Update",


                "SMApply_Success1" : "Fullført! Forespørselen om medlemspålogging ble sendt, og avventer godkjenning.",
                "SMApply_Success2" : "Nettstedets administrator vil sende deg en e-post ( {0} ) så snart forespørselen har blitt godkjent ",
                "SMApply_Success3" : ") once your request has been approved",



                "SMForm_Error_General_Err" : "Serverfeil. prøv igjen senere.",
                "SMForm_Error_Password_Blank" : "Passordfeltet kan ikke stå tomt",
                "SMForm_Error_Password_Retype" : "Passordene stemmer ikke overens",
                "SMForm_Error_Password_Length" : "Passordets lengde må være mellom {0} og {1}",
                "SMForm_Error_Email_Blank" : "E-postfeltet kan ikke stå tomt",
                "SMForm_Error_Email_Invalid" : "E-posten er ugyldig",
                "SMForm_Error_Non_Ascii_Chars" : "Passordet må kun inneholde ASCII-tegn",
                "SMForm_Error_19999" : "Ukjent bruker",
                "SMForm_Error_19995" : "E-posten er allerede i bruk",
                "SMForm_Error_19972" : "Ugyldig token",
                "SMForm_Error_19988" : "Valideringsfeil",
                "SMForm_Error_19984" : "Ugyldig økt",
                "SMForm_Error_19976" : "Feil e-post eller passord",
                "SMForm_Error_19958" : "Forespørselen om medlemskap venter på godkjennelse fra eieren av nettstedet.",
                "SMForm_Error_19980" : "Blokkert av nettstedets eier"




            },

            da: {


                "PasswordLogin_AdministratorLogin": "Administrator Login",
                "SMContainer_Show_Confirm": "Denne side er beskyttet med et login til medlemmer. Dine brugere vil kunne se denne side, når de er logget ind.",
                "SMRegister_sign_up": "Opret",
                "SMLogin_OR": "Or",
                "SMForm_Error_19972": "Ugyldigt symbol",
                "SMLogin_Login": "Log ind",
                "SMForm_Error_19976": "Forkert email eller adgangskode",
                "PasswordLogin_Submit": "Indsend",
                "SMLogin_Remember_Me": "Husk mig",
                "SMResetPassMail_Enter_Email": "Venligst indtast din email adresse",
                "SMForm_Password": "Adgangskode",
                "SMResetPass_Reset_Fail": "Adgangskoden kunne ikke ændres. Prøv igen senere.",
                "SMContainer_OK": "OK",
                "PasswordLogin_Cancel": "Cancel",
                "SMResetPass_Message": "For at angive din nye adgangskode, venligst indtast det i begge felter herunder.",
                "SMResetPass_New_Password": "Indtast en ny adgangskode",
                "SMResetPass_Retype_Password": "Indtast igen:",
                "SMForm_Error_19980": "Blokeret af hjemmeside ejer",
                "SMResetPassMail_confirmation_title": "Venligst check din email",
                "SMForm_Error_19984": "Ugyldig session",
                "PasswordLogin_Wrong_Password": "Venligst indtast det korrekte kodeord",
                "SMResetPass_Reset_Succ": "Du har med succes nulstillet din adgangskode.",
                "SMForm_Error_19988": "Validerings fejl",
                "SMForm_Error_Non_Ascii_Chars": "Kodeord må kun indeholde ASCII tegn",
                "PasswordLogin_Header": "Indtast kodeord for at se denne side",
                "SMRegister_GO": "START",
                "PasswordLogin_Password": "Kodeord",
                "SMResetPassMail_confirmation_msg": "Vi har sendt dig en email med et link, som giver dig mulighed for at nulstille din adgangskode",
                "PasswordLogin_Error_General": "Server error - Unable to log in",
                "SMResetPass_Continue": "Fortsæt",
                "SMLogin_Forgot_Password": "Glemt din adgangskode?",
                "SMForm_Error_Password_Blank": "Adgangskode kan ikke være blank",
                "SMForm_Error_Email_Invalid": "Email er ugyldig",
                "SMForm_Error_19958": "Din medlems anmodning afventer godkendelse fra hjemmesidens ejer.",
                "SMForm_Error_19995": "Email er allerede taget",
                "SMProfile_Update": "Update",
                "SMProfile_Update_Details": "Update your details",
                "SMForm_Email": "Email",
                "SMForm_Error_Password_Length": "Adgangskodens længde skal være mellem {0} og {1}",
                "SMContain_Cancel": "Annuller",
                "SMContainer_Show_Confirm2": "To manage your site's members, go to your My Sites> Manage Site> My Contacts> Site Members",
                "SMContainer_Need_Log_In": "For at se denne side skal du logge ind.",
                "SMForm_Error_19999": "Ukendt bruger",
                "SMRegister_Already_Have_User": "Jeg er allerede bruger",
                "SMForm_Error_Email_Blank": "Email feltet kan ikke være tomt",
                "SMForm_Error_General_Err": "Server fejl. Prøv igen senere.",
                "SMForm_Error_Password_Retype": "Adgangskoderne er ikke ens",
                "SMApply_Success2": "Hjemmeside administratoren vil give dig besked via email( {0} ) når din anmodning er blevet godkendt. ",
                "SMApply_Success1": "Succes! Din medlems login anmodning er sendt og afventer godkendelse.",
                "SMForm_Retype_Password": "Gentag adgangskode",
                "SMRegister_Login": "Log ind",
                "SMResetPassMail_title": "Nulstil adgangskode",
                "SMResetPassMail_Back_Login": "Tilbage til Log ind",



            }
        },
        _keys:{}
    }) ;

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.isVolatile = true;
            args = args || {};
            this.parent(compId, viewNode, args);
            this._container = args.container;
            this._setDictionary(this._container._args.dialogsLanguage);

        },

        onSubmit: function () {
            LOG.reportError(wixErrors.MISSING_METHOD, this.className, 'performSubmit');
            // Override
        },

        getDisplayName: function () {
            LOG.reportError(wixErrors.MISSING_METHOD, this.className, 'getDisplayName');
            // Override
        },

        getSubHeaderElement: function () {
            LOG.reportError(wixErrors.MISSING_METHOD, this.className, 'getSubHeaderElement');
            // Override
        },


        reportAuthStatusChange: function (success, data) {
            this._container.reportAuthStatusChange(success, data);
        },

        closeAndRedirect: function () {
            this._container.closeAndRedirect();
        },

        onCancel: function () {
            // override if needed
        },

        _onFormError: function (err, fieldReference) {
            var errMsg = this._getErrorMessage(err);
            if (fieldReference) {
                fieldReference.setError(errMsg);
            }
            else {
                this._container.onFormError(errMsg);
            }

        },

        _onFormSuccess: function (data) {
            this._container.onFormSuccess(data);
        },

        _getErrorMessage: function (err) {
            var errMsg = this._keys["SMForm_Error_General_Err"];

            if (err) {
                var errorCode = err.errorCode;
                if (typeof errorCode == "number" && errorCode<0){
                    errorCode = "SMForm_Error_"+errorCode.toString().substring(1);
                }
                if (errorCode && this._keys [ errorCode ]) {
                    errMsg = this._keys [ errorCode];
                    var errorParams = err.errorParams;
                    if (errorParams) {
                        var length = errorParams.length || 0;
                        for (var i = 0; i < length; i++) {
                            errMsg = errMsg.replace("{" + i + "}", errorParams[i]);
                        }
                    }
                }
                else {
                    errMsg = this._keys["SMForm_Error_General_Err"] + " (" + errorCode + ")";
                }

                LOG.reportError("Site Members error - " + err.errorDescription + "(" + err.errorCode + ")");
            }

            return errMsg;
        },


        /** Hook Methods **/
        _bindRePasswordField: function (definition) {
            definition.argObject = {
                label: this._keys["SMForm_Retype_Password"],
                passwordField: true
            };

            return this._bindTextDataItem(definition);
        },

        _bindPasswordField: function (definition) {
            definition.argObject = {
                label: this._keys["SMForm_Password"],
                passwordField: true
            };

            return this._bindTextDataItem(definition);
        },

        _bindEmailField: function (definition) {
            definition.argObject = {
                label: this._keys["SMForm_Email"]
            };

            return this._bindTextDataItem(definition);
        },

        _bindTextDataItem: function (definition) {
            definition.dataItem = this.resources.W.Data.createDataItem({'text': '', 'type': 'Text'}, 'Text');
            return definition;
        },
        _setDictionary: function (language){
            this._keys= language&&this.langKeys[language] ? this.langKeys[language] : this.langKeys["en"] ;
        }
    }) ;
});
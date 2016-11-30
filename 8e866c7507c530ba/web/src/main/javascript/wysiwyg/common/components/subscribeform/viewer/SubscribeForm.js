define.component('wysiwyg.common.components.subscribeform.viewer.SubscribeForm', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.utilize(['core.managers.serverfacade.WixRESTClient']);

    def.traits(['wysiwyg.viewer.components.traits.ContactFormUtils', 'wysiwyg.common.components.subscribeform.viewer.common.FormsMethods']);

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Config', 'W.Viewer', 'W.Commands', 'W.Utils', 'W.Resources']);

    def.propertiesSchemaType('SubscribeFormProperties');

    def.dataTypes(['SubscribeForm']);

    def.states({
        dir: ['left', 'right'],
        mob: ['desktop', 'mobile']
    });

    def.statics({
        langKeys: {
            en: {
                "SFORM_ERRORS_404": "Service not found 404",
                "SFORM_ERRORS_main": "An error has occurred",
                "SFORM_ERRORS_noOwner": "Owner email address not set",
                "SFORM_ERRORS_timeOut": "Request timeout",
                "SFORM_eMAIL_subject": "New subscriber via your wix site",
                "SFORM_eMAIL_subject_premium": "New subscriber via your site",
                "SFORM_eMAIL_date": "Sent on:",
                "SFORM_eMAIL_details": "Subscriber Details:",
                "SFORM_eMAIL_title": "You have a new subscriber:",
                "SFORM_eMAIL_tnx": "Thank you for using Wix.com!",
                "SFORM_eMAIL_tnx_premium": "Thank you",
                "SFORM_eMAIL_via": "Via: ",
                "SFORM_user_errorMessage": "Please provide a valid email",
                "SFORM_user_validationErrorMessage": "Please fill in all required fields.",
                "SFORM_user_subscribeFormTitle": "Subscribe for Updates",
                "SFORM_user_submitButtonLabel": "Subscribe Now",
                "SFORM_user_successMessage": "Congrats! You’re subscribed",
                "SFORM_FIELDS_firstname": "Name",
                "SFORM_FIELDS_lastname": "Last Name",
                "SFORM_FIELDS_email": "Email",
                "SFORM_FIELDS_phone": "Mobile Number",
                "SFORM_UNSUBSCRIBE": "(Charges may apply. Text *STOP* anytime to unsubscribe.)"
            },
            es: {
                "SFORM_ERRORS_404": "El servicio solicitado no fue encontrado 404",
                "SFORM_ERRORS_main": "Ha ocurrido un error",
                "SFORM_ERRORS_noOwner": "Email del propietario no está configurado",
                "SFORM_ERRORS_timeOut": "Por favor espera un momento.",
                "SFORM_eMAIL_subject": "Nuevo suscriptor a través de tu sitio de Wix",
                "SFORM_eMAIL_subject_premium": "Nuevo suscriptor a través de tu sitio",
                "SFORM_eMAIL_date": "Enviado:",
                "SFORM_eMAIL_details": "Detalles del Suscriptor:",
                "SFORM_eMAIL_title": "Tienes un nuevo suscriptor:",
                "SFORM_eMAIL_tnx": "¡Gracias por usar Wix.com!",
                "SFORM_eMAIL_tnx_premium": "Gracias",
                "SFORM_eMAIL_via": "Vía:",
                "SFORM_user_subscribeFormTitle": "Suscríbete para Obtener Actualizaciones",
                "SFORM_user_errorMessage": "Por favor introduce un email válido ",
                "SFORM_user_validationErrorMessage": "Por favor rellena todos los campos obligatorios.",
                "SFORM_user_submitButtonLabel": "Suscríbete Ahora",
                "SFORM_user_successMessage": "¡Felicitaciones! Estás suscrito",
                "SFORM_FIELDS_firstname": "Nombre",
                "SFORM_FIELDS_lastname": "Apellido",
                "SFORM_FIELDS_phone": "Teléfono Móvil",
                "SFORM_FIELDS_email": "Email",
                "SFORM_UNSUBSCRIBE": "(Cargos podrán ser aplicados. Envía un mensaje de texto con la palabra \"DETENER\" en cualquier momento para desactivar la suscripción.)"
            },
            de: {
                "SFORM_ERRORS_404": "Dienst nicht gefunden 404",
                "SFORM_ERRORS_main": "Ein Fehler ist aufgetreten",
                "SFORM_ERRORS_noOwner": "E-Mail-Adresse des Eigentümers nicht festgelegt",
                "SFORM_ERRORS_timeOut": "Anfrage-Timeout",
                "SFORM_eMAIL_subject": "Neuer Abonnent über Ihre Website von Wix",
                "SFORM_eMAIL_subject_premium": "Neuer Abonnent über Ihre Website",
                "SFORM_eMAIL_date": "Gesendet am:",
                "SFORM_eMAIL_details": "Abonnent-Details:",
                "SFORM_eMAIL_title": "Sie haben einen neuen Abonnenten:",
                "SFORM_eMAIL_tnx": "Danke, dass Sie Wix.com verwenden!",
                "SFORM_eMAIL_tnx_premium": "Vielen Dank",
                "SFORM_eMAIL_via": "Über:",
                "SFORM_user_subscribeFormTitle": "Neuigkeiten abonnieren",
                "SFORM_user_errorMessage": "Bitte geben Sie eine gültige E-Mail-Adresse ein",
                "SFORM_user_validationErrorMessage": ".Bitte füllen Sie alle erforderlichen Felder aus.",
                "SFORM_user_submitButtonLabel": "Jetzt abonnieren",
                "SFORM_user_successMessage": "Herzlichen Glückwunsch! Sie sind angemeldet.",
                "SFORM_FIELDS_firstname": "Name",
                "SFORM_FIELDS_lastname": "Nachname",
                "SFORM_FIELDS_phone": "Handynummer",
                "SFORM_FIELDS_email": "E-Mail",
                "SFORM_UNSUBSCRIBE": "(Es können Kosten anfallen. Schreiben Sie jederzeit eine SMS mit *STOP*, um sich abzumelden.)"
            },
            fr: {
                "SFORM_ERRORS_404": "Service introuvable 404",
                "SFORM_ERRORS_main": "Une erreur est survenue",
                "SFORM_ERRORS_noOwner": "Adresse email du propriétaire non définie",
                "SFORM_ERRORS_timeOut": "La demande a échoué. Veuillez réessayer",
                "SFORM_eMAIL_subject": "Nouvel abonné via votre site Wix",
                "SFORM_eMAIL_subject_premium": "Nouvel abonné via votre site",
                "SFORM_eMAIL_date": "Envoyé le :",
                "SFORM_eMAIL_details": "Informations Abonné :",
                "SFORM_eMAIL_title": "Vous avez un nouvel abonné :",
                "SFORM_eMAIL_tnx": "Merci d'avoir utilisé Wix.com !",
                "SFORM_eMAIL_tnx_premium": "Merci",
                "SFORM_eMAIL_via": "Via :",
                "SFORM_user_subscribeFormTitle": "Abonnez-vous pour recevoir des Mises à Jour",
                "SFORM_user_errorMessage": "Veuillez saisir un email valide",
                "SFORM_user_validationErrorMessage": "Veuillez remplir tous les champs requis.",
                "SFORM_user_submitButtonLabel": "S'Abonner Maintenant",
                "SFORM_user_successMessage": "Félicitations ! Vous êtes abonné",
                "SFORM_FIELDS_firstname": "Prénom",
                "SFORM_FIELDS_lastname": "Nom",
                "SFORM_FIELDS_phone": "Portable",
                "SFORM_FIELDS_email": "Email",
                "SFORM_UNSUBSCRIBE": "(Des frais peuvent s'appliquer. Envoyez *STOP* par texto à tout moment pour vous désabonner.)"
            },
            it: {
                "SFORM_ERRORS_404": "Servizio non trovato 404",
                "SFORM_ERRORS_main": "Si è verificato un errore",
                "SFORM_ERRORS_noOwner": "Indirizzo email del proprietario non impostato",
                "SFORM_ERRORS_timeOut": "Richiesta scaduta",
                "SFORM_eMAIL_subject": "Nuovo abbonato dal tuo sito wix",
                "SFORM_eMAIL_subject_premium": "Nuovo abbonato dal tuo sito",
                "SFORM_eMAIL_date": "Inviato il:",
                "SFORM_eMAIL_details": "Dettagli dell'Abbonato:",
                "SFORM_eMAIL_title": "Hai un nuovo abbonato:",
                "SFORM_eMAIL_tnx": "Grazie per aver utilizzato Wix.com!",
                "SFORM_eMAIL_tnx_premium": "Grazie",
                "SFORM_eMAIL_via": "Via:",
                "SFORM_user_subscribeFormTitle": "Iscriviti agli Aggiornamenti",
                "SFORM_user_errorMessage": "Ti preghiamo di fornire un'email valida",
                "SFORM_user_validationErrorMessage": "Ti preghiamo di compilare tutti i campi obbligatori.",
                "SFORM_user_submitButtonLabel": "Iscriviti Ora",
                "SFORM_user_successMessage": "Congratulazioni! Ti sei iscritto",
                "SFORM_FIELDS_firstname": "Nome",
                "SFORM_FIELDS_lastname": "Cognome",
                "SFORM_FIELDS_phone": "Cellulare",
                "SFORM_FIELDS_email": "Email",
                "SFORM_UNSUBSCRIBE": "(Potrebbero essere applicati costi. Invia un sms con *STOP\" in qualsiasi momento per cancellare l'iscrizione.)"
            },
            ja: {
                "SFORM_ERRORS_404": "サービスが見つかりません（404）",
                "SFORM_ERRORS_main": "エラーが発生しました",
                "SFORM_ERRORS_noOwner": "オーナーのメールアドレスが設定されていません",
                "SFORM_ERRORS_timeOut": "タイムアウトエラーが発生しました",
                "SFORM_eMAIL_subject": "ホームページからの新規購読者",
                "SFORM_eMAIL_subject_premium": "ホームページからの新規購読者",
                "SFORM_eMAIL_date": "送信日：",
                "SFORM_eMAIL_details": "購読者情報：",
                "SFORM_eMAIL_title": "新規購読者：",
                "SFORM_eMAIL_tnx": "Wix.com をご利用いただき、ありがとうございました！",
                "SFORM_eMAIL_tnx_premium": "ありがとうございました",
                "SFORM_eMAIL_via": "購読申し込み元：",
                "SFORM_user_subscribeFormTitle": "ニュースレター購読",
                "SFORM_user_errorMessage": "有効なメールアドレスを入力してください",
                "SFORM_user_validationErrorMessage": "入力必須項目を全て記入してください。",
                "SFORM_user_submitButtonLabel": "送信",
                "SFORM_user_successMessage": "購読お申し込みありがとうございました",
                "SFORM_FIELDS_firstname": "名前",
                "SFORM_FIELDS_lastname": "名",
                "SFORM_FIELDS_phone": "電話番号",
                "SFORM_FIELDS_email": "携帯電話番号",
                "SFORM_UNSUBSCRIBE": "（通信料が発生することがあります。購読を解除するには、「STOP」とテキストを送信してください。）"
            },

            ko: {
                "SFORM_ERRORS_404": "서비스를 찾을 수 없습니다. (404)",
                "SFORM_ERRORS_main": "오류가 오류가 발생했습니다.",
                "SFORM_ERRORS_noOwner": "이메일 주소를 입력하세요.",
                "SFORM_ERRORS_timeOut": "요청 시간이 초과되었습니다.",
                "SFORM_eMAIL_subject": "내 사이트 새 구독자 정보",
                "SFORM_eMAIL_subject_premium": "내 사이트 새로운 구독자",
                "SFORM_eMAIL_date": "전송일:",
                "SFORM_eMAIL_details": "구독자 정보:",
                "SFORM_eMAIL_title": "다음은 새 구독자의 정보입니다:",
                "SFORM_eMAIL_tnx": "Wix.com을 이용해 주셔서 감사합니다!",
                "SFORM_eMAIL_tnx_premium": "감사합니다.",
                "SFORM_eMAIL_via": "사이트:",
                "SFORM_user_subscribeFormTitle": "업데이트 구독하기",
                "SFORM_user_errorMessage": "유효한 이메일을 입력하세요.",
                "SFORM_user_validationErrorMessage": "필수 입력사항을 입력해 주세요.",
                "SFORM_user_submitButtonLabel": "구독하기",
                "SFORM_user_successMessage": "축하합니다! 사이트가 구독됩니다.",
                "SFORM_FIELDS_firstname": "이름",
                "SFORM_FIELDS_lastname": "성",
                "SFORM_FIELDS_phone": "모바일",
                "SFORM_FIELDS_email": "이메일",
                "SFORM_UNSUBSCRIBE": "(요금이 부과될 수 있습니다. *STOP*을 문자메세지로 보내면 구독이 취소됩니다.)"
            },
            pl: {
                "SFORM_ERRORS_404": "Usługa nie odnaleziona 404",
                "SFORM_ERRORS_main": "Wystąpił błąd",
                "SFORM_ERRORS_noOwner": "Email właściciela nie skonfigurowany",
                "SFORM_ERRORS_timeOut": "Czynność wygasła",
                "SFORM_eMAIL_subject": "Nowy subskrybent z twojej witryny wix",
                "SFORM_eMAIL_subject_premium": "Nowy subskrybent z twojej witryny wix",
                "SFORM_eMAIL_date": "Wysłana dnia:",
                "SFORM_eMAIL_details": "Dane Subskrybenta:",
                "SFORM_eMAIL_title": "Masz nowego subskrybenta:",
                "SFORM_eMAIL_tnx": "Dziękujemy za korzystanie z Wix.com!",
                "SFORM_eMAIL_tnx_premium": "Dziękujemy",
                "SFORM_eMAIL_via": "Poprzez:",
                "SFORM_user_subscribeFormTitle": "Zasubskrybuj Aktualizacje",
                "SFORM_user_errorMessage": "Podaj poprawny adres email",
                "SFORM_user_validationErrorMessage": "Wypełnij wszystkie wymagane pola.",
                "SFORM_user_submitButtonLabel": "Zasubskrybuj Teraz",
                "SFORM_user_successMessage": "Gratulacje! Zostałeś subskrybentem",
                "SFORM_FIELDS_firstname": "Imię",
                "SFORM_FIELDS_lastname": "Nazwisko",
                "SFORM_FIELDS_phone": "Telefon",
                "SFORM_FIELDS_email": "Email",
                "SFORM_UNSUBSCRIBE": "(Możliwe jest pobranie opłaty za usługę. Wyślij SMS z tekstem *STOP*, aby anulować subrkrypcję.)"
            },
            pt: {
                "SFORM_ERRORS_404": "Página não encontrada 404",
                "SFORM_ERRORS_main": "Ocorreu um erro",
                "SFORM_ERRORS_noOwner": "Endereço de email do proprietário não foi definido",
                "SFORM_ERRORS_timeOut": "SFORM_ERRORS_timeOut",
                "SFORM_eMAIL_subject": "Novo assinante através do seu site Wix",
                "SFORM_eMAIL_subject_premium": "Novo assinante através do seu site",
                "SFORM_eMAIL_date": "Enviado em:",
                "SFORM_eMAIL_details": "Detalhes do Assinante:",
                "SFORM_eMAIL_title": "Você tem um novo assinante:",
                "SFORM_eMAIL_tnx": "Obrigado por usar o Wix.com!",
                "SFORM_eMAIL_tnx_premium": "Obrigado",
                "SFORM_user_subscribeFormTitle": "Por favor, insira um email válido",
                "SFORM_user_errorMessage": "Por favor, insira um email válido",
                "SFORM_user_validationErrorMessage": "Por favor, preencha todos os campos obrigatórios.",
                "SFORM_user_submitButtonLabel": "Assine Agora",
                "SFORM_user_successMessage": "Parabéns! Sua assinatura foi concluida",
                "SFORM_eMAIL_via": "Via:",
                "SFORM_FIELDS_firstname": "Nome",
                "SFORM_FIELDS_lastname": "Sobrenome",
                "SFORM_FIELDS_phone": "Número do Celular",
                "SFORM_FIELDS_email": "Email",
                "SFORM_UNSUBSCRIBE": "(Pode haver cobrança de taxas. Escreva *PARE*, a qualquer momento, quando desejar interromper a assinatura.)"
            },
            ru: {
                "SFORM_ERRORS_404": "Сервис не найден 404",
                "SFORM_ERRORS_main": "Произошла ошибка",
                "SFORM_ERRORS_noOwner": "Почта владельца не указана",
                "SFORM_ERRORS_timeOut": "Сервер не отвечает",
                "SFORM_eMAIL_subject": "Новый подписчик через ваш сайт Wix",
                "SFORM_eMAIL_subject_premium": "Новый подписчик через ваш сайт Wix",
                "SFORM_eMAIL_date": "Отправлено:",
                "SFORM_eMAIL_details": "Данные подписчика:",
                "SFORM_eMAIL_title": "У вас появился новый подписчик",
                "SFORM_eMAIL_tnx": "Спасибо, что вы используете Wix.com!",
                "SFORM_eMAIL_tnx_premium": "Спасибо!",
                "SFORM_eMAIL_via": "От:",
                "SFORM_user_subscribeFormTitle": "Подписаться на обновления",
                "SFORM_user_errorMessage": "Пожалуйста, укажите верный email",
                "SFORM_user_validationErrorMessage": "Заполните все обязательные поля.",
                "SFORM_user_submitButtonLabel": "Подписаться",
                "SFORM_user_successMessage": "Поздравляем с новой подпиской!",
                "SFORM_FIELDS_firstname": "Имя",
                "SFORM_FIELDS_lastname": "Фамилия",
                "SFORM_FIELDS_phone": "Мобильный тел.",
                "SFORM_FIELDS_email": "Email",
                "SFORM_UNSUBSCRIBE": "(Может взиматься плата. Пришлите сообщение с текстом *STOP* для отмены подписки.)"
            },


            nl: {

                "SFORM_ERRORS_404" : "404 dienst niet gevonden",
                "SFORM_ERRORS_main" : "Er is een fout opgetreden",
                "SFORM_ERRORS_noOwner" : "E-mailadres eigenaar niet ingesteld",
                "SFORM_ERRORS_timeOut" : "Time-out bij verzoek",



                "SFORM_eMAIL_subject" : "Nieuwe inschrijving via uw Wix-website",
                "SFORM_eMAIL_subject_premium" : "Nieuwe inschrijving via uw website",
                "SFORM_eMAIL_date" : "Verzonden op:",
                "SFORM_eMAIL_details" : "Inschrijfgegevens:",
                "SFORM_eMAIL_title" : "U hebt een nieuwe inschrijving:",
                "SFORM_eMAIL_tnx" : "Bedankt voor het gebruiken van Wix.com!",
                "SFORM_eMAIL_tnx_premium" : "Bedankt",
                "SFORM_eMAIL_via" : "Via:",


                "SFORM_user_errorMessage" : "Vul een geldig e-mailadres in",
                "SFORM_user_validationErrorMessage" : "Vul alle verplichte velden in.",
                "SFORM_user_subscribeFormTitle" : "Abonneren op updates",
                "SFORM_user_submitButtonLabel" : "Nu abonneren",
                "SFORM_user_successMessage" : "Gefeliciteerd! U hebt zich aangemeld",


                "SFORM_FIRSTNAME_FIELD_LABEL" : "Label voornaamveld",
                "SFORM_FIELDS_firstname" : "Naam",
                "SFORM_FIELDS_lastname" : "Achternaam",
                "SFORM_FIELDS_email" : "E-mailadres",
                "SFORM_FIELDS_phone" : "Mobiel nummer",

                "SFORM_UNSUBSCRIBE" : "(Kosten mogelijk van toepassing. Sms *STOP* om u af te melden.)"

            },

            tr: {
                "SFORM_ERRORS_404": "Yeni bir aboneniz var:",
                "SFORM_ERRORS_main": "Bir hata oluştu",
                "SFORM_ERRORS_noOwner": "Sahip e-posta adresi belirtilmedi",
                "SFORM_ERRORS_timeOut": "Talep zaman aşımı",
                "SFORM_eMAIL_subject": "Wix siteniz aracılığıyla yeni abone",
                "SFORM_eMAIL_subject_premium": "Siteniz aracılığıyla yeni abone",
                "SFORM_eMAIL_date": "Gönderim Tarihi:",
                "SFORM_eMAIL_details": "Abone Ayrıntıları:",
                "SFORM_eMAIL_title": "Yeni bir aboneniz var:",
                "SFORM_eMAIL_tnx": "Wix.com'u kullandığınız için teşekkür ederiz!",
                "SFORM_eMAIL_tnx_premium": "Teşekkür ederiz",
                "SFORM_eMAIL_via": "Şunun aracılığıyla:",
                "SFORM_user_subscribeFormTitle": "Güncellemeler için Abone Olun",
                "SFORM_user_errorMessage": "Lütfen geçerli bir e-posta gönderin",
                "SFORM_user_validationErrorMessage": "Lütfen tüm gerekli alanları doldurun.",
                "SFORM_user_submitButtonLabel": "Şimdi Abone Ol",
                "SFORM_user_successMessage": "Tebrikler! Abone oldunuz",
                "SFORM_FIELDS_firstname": "Ad",
                "SFORM_FIELDS_lastname": "Soyad",
                "SFORM_FIELDS_phone": "Cep Telefonu",
                "SFORM_FIELDS_email": "E-posta",
                "SFORM_UNSUBSCRIBE": "(Ücrete tabi olabilir. Aboneliği durdurmak için herhangi bir zaman *STOP* yazarak SMS gönderin.)"
            },

            sv: {


                "SFORM_ERROR_MESSAGE" : "Visa denna text om e-postadress saknas: ",
                "SFORM_ERRORS_badMail" : "Skriv in en giltig e-postadress",
                "SFORM_ERRORS_emptyField" : "Texten bör vara minst 2 tecken lång",
                "SFORM_ERRORS_404" : "Det gick inte att hitta tjänsten 404",
                "SFORM_ERRORS_main" : "Det har uppstått ett fel",
                "SFORM_ERRORS_noOwner" : "Ägarens e-postadress har inte angetts",
                "SFORM_ERRORS_timeOut" : "Begär timeout",




                "SFORM_eMAIL_subject" : "Ny prenumerant via din wix-sida",
                "SFORM_eMAIL_subject_premium" : "Ny prenumerant via din sida",
                "SFORM_eMAIL_date" : "Skickat den:",
                "SFORM_eMAIL_details" : "Prenumerantuppgifter:",
                "SFORM_eMAIL_title" : "Du har en ny prenumerant:",
                "SFORM_eMAIL_tnx" : "Tack för att du använder Wix.com!",
                "SFORM_eMAIL_tnx_premium" : "Tack",
                "SFORM_eMAIL_via" : "Via:",



                "SFORM_user_errorMessage" : "Ange en giltig e-post",
                "SFORM_user_validationErrorMessage" : "Fyll i alla obligatoriska fält.",
                "SFORM_user_subscribeFormTitle" : "Prenumerera för uppdateringar",
                "SFORM_user_submitButtonLabel" : "Prenumerera nu",
                "SFORM_user_successMessage" : "Gratulerar! Du prenumererar",



                "SFORM_FIRSTNAME_FIELD_LABEL" : "Fältetikett: Förnamn",
                "SFORM_FIELDS_firstname" : "Namn",
                "SFORM_FIELDS_lastname" : "Efternamn",
                "SFORM_FIELDS_email" : "E-post",
                "SFORM_FIELDS_phone" : "Mobilnummer",


                "SFORM_UNSUBSCRIBE" : "(Avgifter kan tillkomma. Skicka ett sms med texten *STOPP* om du vill avbryta prenumerationen.)"

            },

            no: {


                "SFORM_ERROR_MESSAGE" : "Hvis e-postadressen mangler:",
                "SFORM_ERRORS_badMail" : "Angi en gyldig e-postadresse",
                "SFORM_ERRORS_emptyField" : "Teksten må inneholde minst 2 tegn",
                "SFORM_ERRORS_404" : "HTTP 404 (ikke funnet)",
                "SFORM_ERRORS_main" : "Det oppsto en feil",
                "SFORM_ERRORS_noOwner" : "Eierens e-postadresse er ikke angitt",
                "SFORM_ERRORS_timeOut" : "Forespørsel tidsavbrutt",



                "SFORM_eMAIL_subject" : "Ny abonnent via nettstedet ditt på Wix",
                "SFORM_eMAIL_subject_premium" : "Ny abonnent via nettstedet ditt",
                "SFORM_eMAIL_date" : "Sendt den:",
                "SFORM_eMAIL_details" : "Informasjon om abonnenten:",
                "SFORM_eMAIL_title" : "Du har fått en ny abonnent:",
                "SFORM_eMAIL_tnx" : "Takk for at du bruker Wix.com!",
                "SFORM_eMAIL_tnx_premium" : "Takk",
                "SFORM_eMAIL_via" : "Via:",

                "SFORM_user_errorMessage" : "Angi en gyldig e-postadresse",
                "SFORM_user_validationErrorMessage" : "Fyll ut alle obligatoriske felter.",
                "SFORM_user_subscribeFormTitle" : "Abonner på oppdateringer",
                "SFORM_user_submitButtonLabel" : "Abonner nå",
                "SFORM_user_successMessage" : "Grattis! Abonnementet ble registrert",


                "SFORM_FIRSTNAME_FIELD_LABEL" : "Etikett for feltet Fornavn",
                "SFORM_FIELDS_firstname" : "Navn",
                "SFORM_FIELDS_lastname" : "Etternavn",
                "SFORM_FIELDS_email" : "E-post",
                "SFORM_FIELDS_phone" : "Mobilnummer",

                "SFORM_UNSUBSCRIBE" : "(kostnader kan påløpe. Send en SMS med *STOP* for å melde deg av.)"
            },

            da: {



                "SFORM_FIRSTNAME_FIELD_LABEL" : "Fornavn felt label",

                "SFORM_ERROR_MESSAGE" : "Hvis e-mailadresse mangler, sig:",

                "SFORM_ERRORS_badMail" : "Venligst indtast en gyldig email",

                "SFORM_ERRORS_emptyField" : "Tekst skal være på mindst 2 tegn",
                "SFORM_ERRORS_404" : "Tjeneste ikke fundet 404",
                "SFORM_ERRORS_main" : "En fejl opstod",
                "SFORM_ERRORS_noOwner" : "Ejers e-mailadresse ikke angivet",
                "SFORM_ERRORS_timeOut" : "Anmodning timeout",
                "SFORM_eMAIL_subject" : "Ny abonnent via din wix hjemmeside",
                "SFORM_eMAIL_subject_premium" : "Ny abonnent via din hjemmeside",
                "SFORM_eMAIL_date" : "Sendt den:",
                "SFORM_eMAIL_details" : "Abonnentens detaljer:",
                "SFORM_eMAIL_title" : "Du har en ny abonnent.",
                "SFORM_eMAIL_tnx" : "Tak fordi du bruger Wix.com!",
                "SFORM_eMAIL_tnx_premium" : "Tak",
                "SFORM_eMAIL_via" : "Via:",
                "SFORM_user_errorMessage" : "Venligst angiv en gyldig email",
                "SFORM_user_validationErrorMessage" : "Udfyld venligst alle påkrævet felter.",
                "SFORM_user_subscribeFormTitle" : "Abonner for opdateringer",
                "SFORM_user_submitButtonLabel" : "Abonner nu",
                "SFORM_user_successMessage" : "Tillykke! Du er tilmeldt",
                "SFORM_FIELDS_firstname" : "Navn",
                "SFORM_FIELDS_lastname" : "Efternavn",
                "SFORM_FIELDS_email" : "E-mail",
                "SFORM_FIELDS_phone" : "Mobil nummer",
                "SFORM_UNSUBSCRIBE" : "(Gebyrer kan forekomme, Send tekst *STOP* når som helst, for at afmelde.)"



            }
        },
        _resizableSides: [
            Constants.BaseComponent.ResizeSides.LEFT,
            Constants.BaseComponent.ResizeSides.RIGHT
        ],
        _useWidthOverMinWidth: true,
        _isComponentNew: true,
        _isMail: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        emailFieldName: 'toEmailAddress',
        bbcEmailFieldName: 'bccEmailAddress',
        actionAttached: false,
        _dataKeyAllowedToTranslate: {
            submitButtonLabel: true,
            successMessage: true,
            errorMessage: true,
            validationErrorMessage: true,
            nameFieldLabel: true,
            firstNameFieldLabel: true,
            lastNameFieldLabel: true,
            emailFieldLabel: true,
            phoneFieldLabel: true,
            subjectFieldLabel: true,
            messageFieldLabel: true,
            addressFieldLabel: true,
            subscribeFormTitle: true
        },
        _dataKeysOveriddenByUser: {},
        _restClient: null,
        _activeFields: null,
        _wasActivated: null,
        isFormRendered: false,
        _selectFilled: false,
        _sizeLimits: {
            minW: 235,
            minH: 120,
            maxW: 980,
            maxH: 1024
        },
        exceptionFields: ['code']
    });

    def.skinParts({
        wrapper: {
            type: 'htmlElement'
        },
        formTitle: {
            type: 'htmlElement',
            optional: true
        },
        firstNameFieldLabel: {
            type: 'htmlElement',
            optional: true
        },
        firstNameField: {
            type: 'htmlElement',
            optional: true
        },
        lastNameFieldLabel: {
            type: 'htmlElement',
            optional: true
        },
        lastNameField: {
            type: 'htmlElement',
            optional: true
        },
        emailFieldLabel: {
            type: 'htmlElement',
            optional: true
        },
        emailField: {
            type: 'htmlElement'
        },
        phoneFieldLabel: {
            type: 'htmlElement',
            optional: true
        },
        phoneField: {
            type: 'htmlElement'
        },
        notifications: {
            type: 'htmlElement'
        },
        submit: {
            type: 'htmlElement'
        }
    });

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },
        getMsgTemplate: function (fields, lingo) {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                date = new Date(),
                htmFields = '',
                tplField = '<div style="margin: 0 0 5px 0; padding: 0;"><b>{{key}}</b> {{val}}</div>',

                tpl = '<div style="margin: 0; padding: 0;">'
                    +    '<div style="margin: 0 0 5px 0; padding: 0;"><b>{{ttl}}</b></div>'
                    +    '<div style="margin: 0 0 15px 0; padding: 0;">{{ttl_via}} ' + window.location.protocol + "//" + window.location.hostname + window.location.pathname + '</div>'
                    +    '<div style="margin: 0 0 5px 0; padding: 0;"><b>{{ttl_details}}</b></div>'
                    +    '<div style="margin: 0 0 25px 0; padding: 0;">'
                    +       '<div  style="margin: 0 0 0 20px; padding: 0;">{{fields}}</div>'
                    +    '</div>'
                    +    '<div style="margin: 0 0 15px 0; padding: 0;"><b>{{ttl_date}}</b> ' + date.getDate() + ' ' + months[date.getMonth()] + ', ' + date.getFullYear() + '</div>'
                    +    '<div style="margin: 0; padding: 0;">{{tnx}}</div>'
                    + '</div>';


            _.each(fields, function (val, key) {
                var label;
                if (!!key && !/^default_/.test(key)) {
                    label = key + ' : ';
                } else {
                    label = '';
                }
                htmFields += tplField.replace('{{key}}', label).replace('{{val}}', val);
            });

            return tpl.replace('{{fields}}', htmFields)
                .replace('{{ttl}}', lingo['msg_title'])
                .replace('{{ttl_via}}', lingo['msg_via'])
                .replace('{{ttl_details}}', lingo['msg_details'])
                .replace('{{ttl_date}}', lingo['msg_date'])
                .replace('{{tnx}}', lingo['msg_tnx']);
        },
        _onRender: function ( renderEvent ) {
            var invalidations = renderEvent.data.invalidations._invalidations,
                isMobile,
                textDirection,
                dataChange;

            ('firstRender' in invalidations) && this._firstRender();

            ('skinChange' in invalidations) && this._resetStatic();

            if('dataChange' in invalidations){
                this._handleKeyTranslations(invalidations.dataChange);
                this.isFormRendered = false;
            }

            if (!this.isSiteReady()) {
                this.invalidate('siteNotReady');
                return;
            }

            isMobile = this.resources.W.Config.env.isViewingSecondaryDevice();
            textDirection = this.getDataItem().get('textDirection');

            this._renderForm();
            this.setHeight(this._skinParts.wrapper.clientHeight);

            this.setState(isMobile ? 'mobile' : 'desktop', 'mob');
            this.setState(textDirection, 'dir');
        },
        _resizeComponent: function(){
            var isMobile = this.resources.W.Config.env.isViewingSecondaryDevice();

            if(this._skin.sizeLimits && !isMobile){
                (this.getHeight() < this._skin.sizeLimits.minH) && this.setHeight(this._skin.sizeLimits.minH);
                (this.getWidth() < this._skin.sizeLimits.minW) && this.setWidth(this._skin.sizeLimits.minW);
                this._sizeLimits = this._skin.sizeLimits;
            } else {
                this._sizeLimits = this._defSizeLimits;
            }
        },
        _resetStatic: function(){
            this.actionAttached = false;
            this._wasActivated = null;
            this._selectFilled = false;
            this.isFormRendered = false;
            this._resizeComponent();
        },
        isSiteReady: function(){
            return this.resources.W.Viewer.isSiteReady();
        },
        isRenderNeeded: function (invalidations) {
            return invalidations.isInvalidated([
                this.INVALIDATIONS.SKIN_CHANGE,
                this.INVALIDATIONS.DATA_CHANGE,
                this.INVALIDATIONS.PART_SIZE,
                this.INVALIDATIONS.DISPLAY,
                'siteNotReady'
            ]);
        },
        _setDictionary: function (language, isPremium) {
            var keys = this.langKeys[language];

            this.lingo = {
                err_404: keys.SFORM_ERRORS_404,
                err_main: keys.SFORM_ERRORS_main,
                err_noOwner: keys.SFORM_ERRORS_noOwner,
                err_timeOut: keys.SFORM_ERRORS_timeOut,
                msg_date: keys.SFORM_eMAIL_date,
                msg_details: keys.SFORM_eMAIL_details,
                msg_title: keys.SFORM_eMAIL_title,
                msg_tnx: isPremium ? keys.SFORM_eMAIL_tnx_premium : keys.SFORM_eMAIL_tnx,
                msg_subj: isPremium ? keys.SFORM_eMAIL_subject_premium : keys.SFORM_eMAIL_subject,
                msg_via: keys.SFORM_eMAIL_via,
                sending: "…",
                firstNameFieldLabel: keys.SFORM_FIELDS_firstname,
                lastNameFieldLabel: keys.SFORM_FIELDS_lastname,
                phoneFieldLabel: keys.SFORM_FIELDS_phone,
                emailFieldLabel: keys.SFORM_FIELDS_email,
                errorMessage: keys.SFORM_user_errorMessage,
                submitButtonLabel: keys.SFORM_user_submitButtonLabel,
                successMessage: keys.SFORM_user_successMessage,
                validationErrorMessage: keys.SFORM_user_validationErrorMessage,
                unSubscribeMessage: keys.SFORM_UNSUBSCRIBE,
                subscribeFormTitle: keys.SFORM_user_subscribeFormTitle
            };
        },
        _preventKeyTranslation: function(key) {
            this._dataKeysOveriddenByUser[key] = true;
        },
        _canKeyBeTranslated: function(key){
            return !!this._dataKeyAllowedToTranslate[key];
        },
        _isKeyOveriddenByUser: function(key){
            return !!this._dataKeysOveriddenByUser[key];
        },
        _handleKeyTranslations: function(dataChange){
            var changedKey = "",
                that = this;

            dataChange.forEach(function(element){
                changedKey = element.field;
                that._canKeyBeTranslated(changedKey) && that._preventKeyTranslation(changedKey);
            });
        },
        _firstRender: function () {
            var config = this.resources.W.Config;
            this._isComponentNew = this._isPreset();
            this._restClient = new this.imports.WixRESTClient();
            this._setDictionary(config.getLanguage(), config.isPremiumUser());
            if (this.resources.W.Config.env.$isPublicViewerFrame) return;
            this._decryptEmails(this.emailFieldName, this.bbcEmailFieldName, this._restClient);
            this._handleMissingEmail(this.emailFieldName);
            this._translatePlaceholdersIfComponentIsNew();

            this._resizeComponent();
        },
        _renderForm: function(){
            if(this.isFormRendered) return;

            this._skinParts.formTitle && this._skinParts.formTitle.set('text', this._data.get('subscribeFormTitle'));
            this._activeFields = this._getNecessaryFields();

            this._wasActivated = this._wasActivated || {};

            if(this._skinParts['submit']){
                this._skinParts['submit'].set('text', this._data.get('submitButtonLabel'));
                this._showSkinPart(this._skinParts['submit']);
                if(!this.actionAttached){
                    this._skinParts['submit'].addEvent( 'click', this._onSubmit.bind(this));
                    this.addEventToSelect();
                    this.actionAttached = !this.actionAttached;
                }
            }
            this._processInput();
            this._fillPhoneCodesDropdown();
//            this._translateNotation();
            this.isFormRendered = true;
        },
        _processInput: function () {
            var self = this;
            _.each(Object.keys(this.getComponentProperties()._schema), function(item){
                var key;
                if(item.indexOf('hidden') !== -1){
                    key = item.replace('hidden', '').replace(/[A-Z]/, function(letter){return letter.toLowerCase()});

                    if(self._activeFields[key]){
                        self._showSkinPart(self._skinParts[key]);
                        if(self._skin.hidePlaceholders){
                            if(self._skinParts[key + 'Label']){
                                self._skinParts[key + 'Label'].innerHTML = "";
                                self._skinParts[key + 'Label'].appendChild(self._escapeHtml(self._data.get(key + 'Label')));
                            }
                        }
                        self._setActions(self._activeFields[key]['fields'], (key + 'Label'), self._wasActivated[key]);
                        if(!self._wasActivated[key]) self._wasActivated[key] = true
                    } else {
                        self._hideSkinPart(self._skinParts[key]);
                    }
                }
            });
        },
        _showSkinPart: function(skinPart){
            skinPart && (skinPart.getParent('.row') || skinPart).removeClass('hidden');
        },
        _hideSkinPart: function(skinPart){
            skinPart && (skinPart.getParent('.row') || skinPart).addClass('hidden');
        },
        _setActions: function(fields, label, isActivated){
            var self = this;
            _.each(fields, function(field){

                if(!isActivated)
                    $(field).addEvent('focus', function () {
                        $(this).removeClass('error');
                    });

                if(!self._skin.hidePlaceholders && field.getAttribute('data-skip-placeholder') !== 'true'){

                    field.setAttribute('placeholder', self._escapeHtml(self._data.get(label)).nodeValue);
                    if(!window.Modernizr.input.placeholder){
                        if(!isActivated) self.setPHPoly(field);
                        field.value = self._escapeHtml(self._data.get(label)).nodeValue;
                    }
                }
            });
        },
        _getNecessaryFields: function(){
            var fields = {}, self = this;
            _.each(this.getComponentProperties()._data, function(propery, index){
                if(index.indexOf('hidden') !== -1 && propery){
                    var name = index.replace('hidden', ''),
                        isRequire = self.getComponentProperty('required' + name),
                        fieldName = name.replace(/[A-Z]/, function(letter){return letter.toLowerCase()});

                    fields[fieldName] = {
                        isRequire: isRequire,
                        fields: self._getInputsFromSkinPart(self._skinParts[fieldName])
                    };
                }
            });
            return fields;
        },
        _getInputsFromSkinPart: function(skinPart){
            if(this.isInput(skinPart)){
                return [skinPart];
            } else if(skinPart.children && skinPart.children.length){
                var _elements = skinPart.getElements('select, input, texarea'),
                    _elToReturn = [];
                for(var i = 0, j = _elements.length; i < j; i++){
                    !this.exceptFromCollection(_elements[i].getAttribute('name')) &&  _elToReturn.push(_elements[i]);
                }
                return _elToReturn;
            }
        },
        _actionWithActiveFields: function(callback, scope){
            var self = this;
            _.each(this._activeFields, function (field) {
                _.each(field['fields'], function(input){
                    if(input.nodeType && input.nodeType === 1) callback.call(scope || self, input);
                });
            }, this);
        },
        isInput: function (element) {
            return /(textarea|input|select)/.test(element.nodeName.toLowerCase());
        },
        _onSubmit: function () {
            var dataItem = this.getDataItem(),
                toMail = dataItem.get('toEmailAddress'),
                bccMail = dataItem.get('bccEmailAddress'),
                fields,
                htmlMessage,
                formattedData,
                self = this,
                removeMessage = function(){
                    var messageElement = self._skinParts.notifications;
                    if (self._skin.successMessageOutside){
                        messageElement = self._skinParts.wrapper.getElement('.message');
                    }

                    messageElement.removeClass('error');
                    messageElement.removeClass('success');

                    self._skinParts['wrapper'].removeEvent('click', removeMessage, true);
                };

            if (!toMail || toMail === 'a33012eff368a577d48f52f310c92140') {//no email, or encoded empty string
                this._showMessage(this.lingo['err_noOwner'], true, true);
                return;
            }

            if (!this._isValid()) return;

            fields = this.preFormatFields();

            htmlMessage = this.getMsgTemplate(fields.forSend, this.lingo);
            formattedData = this._formatData(fields.forReport, htmlMessage, toMail, bccMail);

            this._showMessage("", false, false);

            this._showMessage(this.lingo['sending'], false, true);

            if (this.resources.W.Config.env.$isPublicViewerFrame) {
                this._reportActivity(fields.forReport)
                    .then(function(){
                        this._sendMail(this.getMailServerUrl(), formattedData, true);
                        this.sendBiEvent(wixEvents.FORM_SUBMIT, {c1: this.getID(), c2: this.className});
                        this.activateFallback(this.getFallbackMailServerUrl(), formattedData);
                        this._skinParts['wrapper'].addEventListener('click', removeMessage, true);
                    }.bind(this)).fail(function(){
                        this._showMessage(this.lingo['err_main'], true, true);
                        this._skinParts['wrapper'].addEventListener('click', removeMessage, true);
                    }.bind(this));
            }

        },
        _formatData: function (fields, html, to, bcc) {
            var inputValue = function (key) {
                var val = fields[key];
                return !!val ? val : 'n/a';
            };

            return {
                'to': [{
                    address: to || 'n/a',
                    personal: to || 'n/a'
                }],
                'bcc': !!bcc ? [{
                    address: bcc || 'n/a',
                    personal: bcc || 'n/a'
                }] : [],
                'cc': [],
                'from': {
                    address: inputValue('email'),
                    personal: [(inputValue('first') !== 'n/a' ? inputValue('first') : ''), (inputValue('last') !== 'n/a' ? inputValue('last') : '')].join(' ')
                },
                'subject': this.lingo['msg_subj'],
                'metaSiteId': rendererModel.metaSiteId || 'dc853130-4fb2-464f-878d-3b6667dc4f97',
                'htmlMessage': html,
                'plainTextMessage': inputValue('message')
            };
        },
        _reportActivity: function(fields) {
            var defer = Q.defer();
            this.resources.W.Commands.executeCommand('WViewerCommands.Activity.Report', {
                name: 'SubscribeForm',
                fields: fields,
                callbacks: {
                    onSuccess: function(){
                        defer.resolve();
                    },
                    onError: function(){
                        defer.reject();
                    }
                }
            });
            return defer.promise;
        },

        _sendMail: function(url, data, tryAgain) {
            this.messageSent = false;
            this._restClient.post(url, data, {
                "onSuccess": function() {
                    this._showMessage(this._data.get('successMessage'), false, true);

                    this.messageSent = true;
                    this._cleanForm();
                    this.sendBiEvent(wixEvents.FORM_SUBMIT_SUCCESS, {c1: this.getID(), c2: this.className});
                }.bind(this),
                "onError": function(response) {
                    this.response = response;
                    if(tryAgain) {
                        this.sendBiError(wixErrors.SUBSCRIBE_FORM_SUBMIT_FAILURE, 'wysiwyg.common.components.subscribeform.viewer.SubscribeForm', '_sendMail', {response: this.response});
                    } else {
                        this._showMessage(this.lingo['err_main'], true, true);
                        this.sendBiError(wixErrors.SUBSCRIBE_FORM_SUBMIT_FINAL_FALLBACK, 'wysiwyg.common.components.subscribeform.viewer.SubscribeForm', '_sendMail', {response: this.response});
                    }
                }.bind(this)
            });
        },

        activateFallback: function (url, formattedData) {
            setTimeout(function () {
                if (!this.messageSent) {
                    this._sendMail(url, formattedData, false);
                }
            }.bind(this), 5000);
        },

        sendBiError: function(err, className, methodName, params) {
            LOG.reportError(err, className, methodName, JSON.stringify(params));
        },

        sendBiEvent: function(event, params) {
            LOG.reportEvent(event, params);
        },

        _cleanForm: function () {
            var poly = !window.Modernizr.input.placeholder,
                self = this;

            this._actionWithActiveFields(function(element){
                $(element).removeClass('error');
                if(!self.exceptFromCollection(element.getAttribute('name')) && element.tagName.toLowerCase() !== 'select') element.value = '';
                if (poly) element.focus();
            }, this);
        },
        exceptFromCollection: function(name){
            return !!~this.exceptionFields.indexOf(name);
        },
        preFormatFields: function () {
            var self = this, forSend = {}, forReport = {};

            _.each(Object.keys(this._activeFields), function(key){
                var val = '', fieldName, fieldAmount = 0;
                _.each(self._activeFields[key]['fields'], function(input){

                    if(input.value && !self.exceptFromCollection(input.getAttribute('name')) && !$(input).hasClass('isPlaceholder')) {
                        val += self._transfortToHtmlEntites(self._escapeHtml(input.value).nodeValue);
                        fieldAmount++;
                    }

                    fieldName = input.name ? self._transfortToHtmlEntites(self._escapeHtml(input.name).nodeValue) : "";
                });
                if(self._activeFields[key]['fields'].length === fieldAmount){
                    forSend[self._data.get(key + 'Label')] = val;
                    if(fieldName) forReport[fieldName] = val;
                }
            });

            return {
                forSend: forSend,
                forReport: forReport
            };
        },
        _showMessage: function( msg, error , isOutside) {
            var container = this._skinParts['notifications'];
            if(isOutside || this._skin.successMessageOutside){
                container = (this._skin.successMessageOutside && this._skinParts['wrapper'].getElement('.message')) ? this._skinParts['wrapper'].getElement('.message') : this._skinParts['notifications'];
            }

            container.set('text', msg);

            container.removeClass('error');
            container.removeClass('success');
            if(msg) container.addClass(error ? 'error' : 'success');
        },
        _isValid: function () {
            var ok = true, bad = [], additionalFields = document.querySelectorAll('.additionalField');

            if (!this._isMail.test(this._skinParts['emailField'].value.replace(/^\s+|\s+$/g, ''))) {
                $(this._skinParts['emailField']).addClass('error');
                _.each(additionalFields, function(field) {
                    field.addClass('error');
                });
                this._showMessage(this._data.get('errorMessage'), 1);
                return !ok;
            } else $(this._skinParts['emailField']).removeClass('error');

            _.each(this._activeFields, function(property){
                if(property['isRequire']){
                    for(var i = 0, j = property.fields.length; i < j; i++){
                        if((property.fields[i].nodeType && property.fields[i].nodeType === 1)){
                            (!property.fields[i].value ||
                                !property.fields[i].value.replace(/^\s+|\s+$/g, '') ||
                                $(property.fields[i]).hasClass('isPlaceholder')) && bad.push(property.fields[i]);
                        }
                    }
                }
            });

            if (_.isEmpty(bad)) {
                _.each(this._skinParts, function (input) {
                    _.each(additionalFields, function(field) {
                        field.removeClass('error');
                    });
                    $(input).removeClass('error');
                });
            } else {
                ok = false;

                _.each(bad, function (input) {
                    _.each(additionalFields, function(field) {
                        field.addClass('error');
                    });
                    $(input).addClass('error');
                });

                this._showMessage(this._data.get('validationErrorMessage'), 1);
            }

            return ok;
        },
        _translatePlaceholdersIfComponentIsNew: function(){
            if (this._isComponentNew) {
                this._dataKeysOveriddenByUser = {};
                this._translateUserMsg();
            }
        },
        _translateUserMsg: function () {
            _.each({
                'subscribeFormTitle': 'Subscribe for Updates',
                'submitButtonLabel': 'Subscribe',
                'successMessage': 'Your details were sent successfully!',
                'errorMessage': 'Please provide a valid email',
                'validationErrorMessage': 'Please fill in all required fields.',
                'firstNameFieldLabel': 'First Name',
                'lastNameFieldLabel': 'Last Name',
                'emailFieldLabel': 'Email',
                'phoneFieldLabel': 'Phone'
            }, function(val, key){
                this._translateIfAllowed(this.getDataItem(), key, val);
            }, this);
        },
        _translateIfAllowed: function(data, dataKey, defaultValue){
            if(this._canKeyBeTranslated(dataKey) && !this._isKeyOveriddenByUser(dataKey)) {
                data.set(dataKey, this.lingo[dataKey] || defaultValue);
            }
        },
        _translateNotation: function(){
            this._skinParts['phoneMessage'].set('text', this.lingo['unSubscribeMessage'])
        },
        _isPreset: function(){
            return !!this.getDataItem().getMeta('isPreset');
        },
        _fillPhoneCodesDropdown: function(){
            if(!this.getComponentProperty('hiddenPhoneField') || this._selectFilled){
                this._hideSkinPart(this._skinParts['phoneMessage']);
            } else {
                this._showSkinPart(this._skinParts['phoneMessage']);
                var select = this._skinParts['phoneField'].getElementsByTagName('select')[0],
                    userCountryCode = this.getUserCountryCode();

                _.each(this.getCountryCodes(), function(country, countryCode){
                    if(country['phoneCode'] && country['phoneCode'] !== ""){
                        var option = document.createElement('option');
                        option.innerHTML = country['countryName'] + " " + country['phoneCode'];
                        option.setAttribute('value', country['phoneCode']);

                        if(countryCode.toLowerCase() === userCountryCode.toLowerCase()){
                            option.setAttribute('selected', 'selected');
                            select.parentNode.getElement('.selected').set('value', country['phoneCode']);
                        }

                        select.appendChild(option);
                    }
                });

                this._selectFilled = true;
            }
        },
        addEventToSelect: function(){
            if(this.actionAttached) return;
            var select = this._skinParts['phoneField'].getElement('select'),
                phoneInput = this._skinParts['phoneField'].getElement('[name="phone"]');

            if(select){
                select.addEvent('change', function(){
                    this.parentNode.getElement('.selected').set('value', this.value);
                });
            }

            phoneInput && phoneInput.addEvent('keyup', this._validateNumbers);
            this._skinParts['firstNameField'] && this._skinParts['firstNameField'].addEvent('keyup', this._validateLength);
            this._skinParts['lastNameField'] && this._skinParts['lastNameField'].addEvent('keyup', this._validateLength);
        },
        _validateLength: function(){
            if(this.value.length > 100) this.value = this.value.substring(0, 100);
        },
        _validateNumbers: function(){
            this.value = this.value.replace(/[^0-9]/g, '');
            if(this.value.length > 25) this.value = this.value.substring(0, 25);
        },
        getCountryCodes: function(){
            return Constants.COUNTRY_LANGUAGES.countries;
        },
        getUserCountryCode: function(){
            return window.rendererModel && window.rendererModel.geo;
        }
    });
});
define.component('wysiwyg.viewer.components.ContactForm', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Config', 'W.Viewer', 'W.Commands', 'W.Utils', 'W.Resources']);

    def.dataTypes(['ContactForm']);

    def.propertiesSchemaType('ContactFormProperties');

    def.traits(['wysiwyg.viewer.components.traits.ContactFormUtils']);

    def.utilize(['core.managers.serverfacade.WixRESTClient']);

    def.binds(['_onSubmit', '_preventKeyTranslation', '_canKeyBeTranslated']);

    def.skinParts({
        wrapper: {
            type: 'htmlElement'
        },
        name: {
            type: 'htmlElement'
        },
        subject: {
            type: 'htmlElement'
        },
        message: {
            type: 'htmlElement'
        },
        phone: {
            type: 'htmlElement'
        },
        email: {
            type: 'htmlElement'
        },
        address: {
            type: 'htmlElement'
        },
        label_name: {
            type: 'htmlElement',
            optional: true
        },
        label_subject: {
            type: 'htmlElement',
            optional: true
        },
        label_message: {
            type: 'htmlElement',
            optional: true
        },
        label_phone: {
            type: 'htmlElement',
            optional: true
        },
        label_email: {
            type: 'htmlElement',
            optional: true
        },
        label_address: {
            type: 'htmlElement',
            optional: true
        },
        notifications: {
            type: 'htmlElement'
        },
        submit: {
            type: 'htmlElement'
        }
    });

    def.statics({
        langKeys: {
            en: {

                "CFORM_ERRORS_404": "service not found 404",
                "CFORM_ERRORS_main": "an error has occurred",
                "CFORM_ERRORS_noOwner": "Owner email address not set",
                "CFORM_ERRORS_timeOut": "request timeout",
                "CFORM_eMAIL_date": "Sent on:",
                "CFORM_eMAIL_details": "Message Details: ",
                "CFORM_eMAIL_title": "You have a new message: ",
                "CFORM_eMAIL_tnx": "Thank you for using Wix.com!",
                "CFORM_eMAIL_via": "Via: ",
                "CFORM_user_errorMessage": "Please provide a valid email",
                "CFORM_user_validationErrorMessage": "Please fill in all required fields.",
                "CFORM_user_submitButtonLabel": "Send",
                "CFORM_user_successMessage": "Your details were sent successfully!",
                "CFORM_FIELDS_name": "Name",
                "CFORM_FIELDS_email": "Email",
                "CFORM_FIELDS_phone": "Phone",
                "CFORM_FIELDS_subject": "Subject",
                "CFORM_FIELDS_message": "Message",
                "CFORM_FIELDS_address": "Address"
            },
            es: {
                "CFORM_ERRORS_404": "sevicio no encontrado 404",
                "CFORM_ERRORS_main": "ha ocurrido un error",
                "CFORM_ERRORS_noOwner": "Email del propietario no está configurado",
                "CFORM_ERRORS_timeOut": "tiempo expirado",
                "CFORM_eMAIL_date": "Enviado:",
                "CFORM_eMAIL_details": "Detalles del Mensaje: ",
                "CFORM_eMAIL_title": "Tienes un mensaje nuevo: ",
                "CFORM_eMAIL_tnx": "¡Gracias por usar Wix.com!",
                "CFORM_eMAIL_via": "Vía: ",
                "CFORM_user_errorMessage": "Por favor introduce un email válido ",
                "CFORM_user_validationErrorMessage": "Por favor rellena todos los campos obligatorios. ",
                "CFORM_user_submitButtonLabel": "Enviar",
                "CFORM_user_successMessage": "¡Tus datos se enviaron con éxito!",
                "CFORM_FIELDS_name": "Nombre",
                "CFORM_FIELDS_phone": "Teléfono",
                "CFORM_FIELDS_subject": "Asunto",
                "CFORM_FIELDS_email": "Email",
                "CFORM_FIELDS_message": "Mensaje",
                "CFORM_FIELDS_address": "Dirección"
            },
            de: {
                "CFORM_ERRORS_404": "Dienst nicht gefunden 404",
                "CFORM_ERRORS_main": "Ein Fehler ist aufgetreten",
                "CFORM_ERRORS_noOwner": "E-Mail-Adresse des Eigentümers nicht festgelegt",
                "CFORM_ERRORS_timeOut": "Anfrage abgelaufen",
                "CFORM_eMAIL_date": "Gesendet am:",
                "CFORM_eMAIL_details": "Nachrichtendetails: ",
                "CFORM_eMAIL_title": "Sie haben eine neue Nachricht: ",
                "CFORM_eMAIL_tnx": "Danke, dass Sie Wix.com verwenden!",
                "CFORM_eMAIL_via": "Über: ",
                "CFORM_user_errorMessage": "Bitte geben Sie eine gültige E-Mail-Adresse ein",
                "CFORM_user_validationErrorMessage": "Bitte füllen Sie alle erforderlichen Felder aus.",
                "CFORM_user_submitButtonLabel": "Senden",
                "CFORM_user_successMessage": "Ihre Angaben wurden erfolgreich versandt!",
                "CFORM_FIELDS_name": "Name",
                "CFORM_FIELDS_phone": "Telefon",
                "CFORM_FIELDS_subject": "Betreff",
                "CFORM_FIELDS_email": "Email",
                "CFORM_FIELDS_message": "Nachricht",
                "CFORM_FIELDS_address": "Adresse"
            },
            fr: {
                "CFORM_ERRORS_404": "service non trouvé 404",
                "CFORM_ERRORS_main": "une erreur s'est produite",
                "CFORM_ERRORS_noOwner": "Adresse email du propriétaire non défini",
                "CFORM_ERRORS_timeOut": "délai expiré",
                "CFORM_eMAIL_date": "Envoyé le:",
                "CFORM_eMAIL_details": "Détails du message: ",
                "CFORM_eMAIL_title": "Vous avez un nouveau message: ",
                "CFORM_eMAIL_tnx": "Merci d'avoir utilisé Wix.com!",
                "CFORM_eMAIL_via": "Via: ",
                "CFORM_user_errorMessage": "Veuillez saisir un email valide",
                "CFORM_user_validationErrorMessage": "Veuillez remplir tous les champs requis.",
                "CFORM_user_submitButtonLabel": "Envoyer",
                "CFORM_user_successMessage": "Vos informations ont bien été envoyées !",
                "CFORM_FIELDS_name": "Nom",
                "CFORM_FIELDS_phone": "Téléphone",
                "CFORM_FIELDS_subject": "Sujet",
                "CFORM_FIELDS_email": "Email",
                "CFORM_FIELDS_message": "Message",
                "CFORM_FIELDS_address": "Adresse"
            },
            it: {
                "CFORM_ERRORS_404": "servizio non trovato 404",
                "CFORM_ERRORS_main": "si è verificato un errore",
                "CFORM_ERRORS_noOwner": "Indirizzo email del proprietario non impostato",
                "CFORM_ERRORS_timeOut": "tempo scaduto",
                "CFORM_eMAIL_date": "Inviato il:",
                "CFORM_eMAIL_details": "Dettagli del Messaggio: ",
                "CFORM_eMAIL_title": "Hai un nuovo messaggio: ",
                "CFORM_eMAIL_tnx": "Grazie per aver utilizzato Wix.com!",
                "CFORM_eMAIL_via": "Via: ",
                "CFORM_user_errorMessage": "Ti preghiamo di fornire un'email valida",
                "CFORM_user_validationErrorMessage": "Ti preghiamo di compilare tutti i campi obbligatori.",
                "CFORM_user_submitButtonLabel": "Inviare",
                "CFORM_user_successMessage": "I tuoi dati sono stati inviati con successo!",
                "CFORM_FIELDS_name": "Nome",
                "CFORM_FIELDS_phone": "Telefono",
                "CFORM_FIELDS_subject": "Oggetto",
                "CFORM_FIELDS_email": "Email",
                "CFORM_FIELDS_message": "Messaggio",
                "CFORM_FIELDS_address": "Indirizzo"
            },
            ja: {
                "CFORM_ERRORS_404": "404エラー：サービスがみつかりませんでした",
                "CFORM_ERRORS_main": "エラーが発生しました",
                "CFORM_ERRORS_noOwner": "オーナーのメールアドレスが設定されていません",
                "CFORM_ERRORS_timeOut": "要求はタイムアウトしました",
                "CFORM_eMAIL_date": "送信日：",
                "CFORM_eMAIL_details": "メッセージの詳細： ",
                "CFORM_eMAIL_title": "新着メッセージがあります： ",
                "CFORM_eMAIL_tnx": "Wix.comをご利用いただき、ありがとうございました！",
                "CFORM_eMAIL_via": "発信元： ",
                "CFORM_user_errorMessage": "有効なメールアドレスを入力してください",
                "CFORM_user_validationErrorMessage": "入力必須項目を全て記入してください。",
                "CFORM_user_submitButtonLabel": "送信",
                "CFORM_user_successMessage": "詳細が無事送信されました！",
                "CFORM_FIELDS_name": "お名前",
                "CFORM_FIELDS_phone": "電話番号",
                "CFORM_FIELDS_subject": "件名",
                "CFORM_FIELDS_email": "Email",
                "CFORM_FIELDS_message": "メッセージ",
                "CFORM_FIELDS_address": "住所"
            },
            ko: {
                "CFORM_ERRORS_404": "오류 404- 서비스를 찾을 수 없습니다.",
                "CFORM_ERRORS_main": "오류가 발생했습니다.",
                "CFORM_ERRORS_noOwner": "소유자의 이메일 주소가 설정되지 않았습니다.",
                "CFORM_ERRORS_timeOut": "요청시간 초과",
                "CFORM_eMAIL_date": "전송일:",
                "CFORM_eMAIL_details": "메세지 세부사항: ",
                "CFORM_eMAIL_title": "새 메세지가 도착했습니다: ",
                "CFORM_eMAIL_tnx": "Wix.com을 사용해 주셔서 감사합니다!",
                "CFORM_eMAIL_via": "발신 사이트: ",
                "CFORM_user_errorMessage": "유효한 이메일을 입력하세요.",
                "CFORM_user_validationErrorMessage": "필수 입력사항을 입력해 주세요.",
                "CFORM_user_submitButtonLabel": "보내기",
                "CFORM_user_successMessage": "세부정보가 성공적으로 전송되었습니다!",
                "CFORM_FIELDS_name": "이름",
                "CFORM_FIELDS_phone": "전화번호",
                "CFORM_FIELDS_subject": "제목",
                "CFORM_FIELDS_email": "Email",
                "CFORM_FIELDS_message": "메세지",
                "CFORM_FIELDS_address": "주소"
            },
            pl: {
                "CFORM_ERRORS_404": "błąd usługi 404",
                "CFORM_ERRORS_main": "wystąpił błąd",
                "CFORM_ERRORS_noOwner": "Email właściciela nie skonfigurowany",
                "CFORM_ERRORS_timeOut": "wygaśnięcie prośby",
                "CFORM_eMAIL_date": "Wysłana dnia:",
                "CFORM_eMAIL_details": "Szczegóły Wiadomości: ",
                "CFORM_eMAIL_title": "Otrzymałeś nową wiadomość: ",
                "CFORM_eMAIL_tnx": "Dziękujemy za korzystanie z Wix.com!",
                "CFORM_eMAIL_via": "Poprzez: ",
                "CFORM_user_errorMessage": "Podaj poprawny adres email",
                "CFORM_user_validationErrorMessage": "Wypełnij wszystkie wymagane pola.",
                "CFORM_user_submitButtonLabel": "Wyślij",
                "CFORM_user_successMessage": "Twoje informacje zostały pomyślnie przesłane!",
                "CFORM_FIELDS_name": "Imię",
                "CFORM_FIELDS_phone": "Telefon",
                "CFORM_FIELDS_subject": "Temat",
                "CFORM_FIELDS_email": "Email",
                "CFORM_FIELDS_message": "Wiadomość",
                "CFORM_FIELDS_address": "Adres"
            },
            pt: {
                "CFORM_ERRORS_404": "Serviço não encontrado 404",
                "CFORM_ERRORS_main": "ocorreu um erro",
                "CFORM_ERRORS_noOwner": "Endereço de e-mail do proprietário não está configurado",
                "CFORM_ERRORS_timeOut": "tempo expirou",
                "CFORM_eMAIL_date": "Enviado:",
                "CFORM_eMAIL_details": "Detalhes da Mensagem: ",
                "CFORM_eMAIL_title": "Você tem uma nova mensagem: ",
                "CFORM_eMAIL_tnx": "Obrigado por usar Wix.com!",
                "CFORM_user_errorMessage": "Por favor, insira um e-mail válido",
                "CFORM_user_validationErrorMessage": "Por favor, preencha os campos obrigatórios.",
                "CFORM_user_submitButtonLabel": "Enviar",
                "CFORM_user_successMessage": "Seus detalhes foram enviados com sucesso!",
                "CFORM_eMAIL_via": "Via: ",
                "CFORM_FIELDS_name": "Nome",
                "CFORM_FIELDS_phone": "Telefone",
                "CFORM_FIELDS_subject": "Assunto",
                "CFORM_FIELDS_email": "Email",
                "CFORM_FIELDS_message": "Mensagem",
                "CFORM_FIELDS_address": "Endereço"
            },
            ru: {
                "CFORM_ERRORS_404": "Сервис не найден 404",
                "CFORM_ERRORS_main": "Произошла ошибка",
                "CFORM_ERRORS_noOwner": "Почта владельца не указана",
                "CFORM_ERRORS_timeOut": "Запрос устарел",
                "CFORM_eMAIL_date": "Отправлено:",
                "CFORM_eMAIL_details": "Детали сообщения: ",
                "CFORM_eMAIL_title": "У вас новое сообщение: ",
                "CFORM_eMAIL_tnx": "Спасибо, что вы используете Wix.com!",
                "CFORM_eMAIL_via": "От: ",
                "CFORM_user_errorMessage": "Пожалуйста, введите действительный email",
                "CFORM_user_validationErrorMessage": "Пожалуйста, заполните все обязательные поля.",
                "CFORM_user_submitButtonLabel": "Отправить",
                "CFORM_user_successMessage": "Информация успешно отправлена!",
                "CFORM_FIELDS_name": "Имя",
                "CFORM_FIELDS_phone": "Телефон",
                "CFORM_FIELDS_subject": "Тема",
                "CFORM_FIELDS_email": "Email",
                "CFORM_FIELDS_message": "Сообщение",
                "CFORM_FIELDS_address": "Адрес"
            },


            nl: {

                "CFORM_ERRORS_badMail" : "Vul een geldig e-mailadres in",
                "CFORM_ERRORS_toLong" : "Tekst mag maximaal 200 tekens bevatten",
                "CFORM_ERRORS_toShort" : "Tekst moet minimaal 2 tekens bevatten",
                "CFORM_ERRORS_noOwner" : "E-mailadres eigenaar niet ingesteld",
                "CFORM_ERRORS_404" : "404 dienst niet gevonden",
                "CFORM_ERRORS_main" : "er is een fout opgetreden",
                "CFORM_ERRORS_timeOut" : "time-out bij verzoek",

                "CFORM_eMAIL_title" : "U hebt een nieuw bericht: ",
                "CFORM_eMAIL_via" : "Via: ",
                "CFORM_eMAIL_details" : "Berichtinformatie: ",
                "CFORM_eMAIL_date" : "Verzonden op:",
                "CFORM_eMAIL_tnx" : "Bedankt voor het gebruiken van Wix.com!",


                "CFORM_user_submitButtonLabel" : "Verzenden",
                "CFORM_user_successMessage" : "Uw gegevens zijn verzonden!",
                "CFORM_user_errorMessage" : "Vul een geldig e-mailadres in",
                "CFORM_user_validationErrorMessage" : "Vul alle verplichte velden in.",


                "CFORM_FIELDS_emailTo" : "Ontvanger (verplicht):",
                "CFORM_FIELDS_bccTo" : "BCC:",
                "CFORM_FIELDS_name" : "Naam",
                "CFORM_FIELDS_email" : "E-mailadres",
                "CFORM_FIELDS_phone" : "Telefoonnummer",
                "CFORM_FIELDS_subject" : "Onderwerp",
                "CFORM_FIELDS_message" : "Bericht",
                "CFORM_FIELDS_address" : "Adres",
                "CFORM_FIELDS_placeholder" : "Veldlabel",
                "CFORM_FIELDS_email_placeholder" : "Label e-mailadresveld",
                "CFORM_FIELDS_name_placeholder" : "Label naamveld",
                "CFORM_FIELDS_submitButtonLabel" : "Tekst verzendknop",
                "CFORM_FIELDS_successMessage" : "Succesbericht",
                "CFORM_FIELDS_errorMessage" : "Foutmelding voor e-mailadres",
                "CFORM_FIELDS_validationErrorMessage" : "Foutmelding voor verplichte velden",
            },



            tr: {
                "CFORM_ERRORS_404": "Hizmet bulunamadı 404",
                "CFORM_ERRORS_main": "bir hata oluştu",
                "CFORM_ERRORS_noOwner": "Sahip e-posta adresi ayarlanmadı",
                "CFORM_ERRORS_timeOut": "talep zaman aşımı",
                "CFORM_eMAIL_date": "Gönderim Tarihi:",
                "CFORM_eMAIL_details": "Mesaj Bilgileri: ",
                "CFORM_eMAIL_title": "Yeni mesajınız var: ",
                "CFORM_eMAIL_tnx": "Wix.com'u kullandığınız için teşekkür ederiz!",
                "CFORM_eMAIL_via": "Şunun aracılığıyla: ",
                "CFORM_user_errorMessage": "Lütfen geçerli bir e-posta gönderin",
                "CFORM_user_validationErrorMessage": "Lütfen tüm gerekli alanları doldurun.",
                "CFORM_user_submitButtonLabel": "Gönder",
                "CFORM_user_successMessage": "Ayrıntılarınız gönderildi",
                "CFORM_FIELDS_name": "Ad",
                "CFORM_FIELDS_phone": "Telefon",
                "CFORM_FIELDS_subject": "Konu",
                "CFORM_FIELDS_email": "Email",
                "CFORM_FIELDS_message": "Mesaj",
                "CFORM_FIELDS_address": "Adres"
            },

            sv: {

                "CFORM_ERRORS_badMail" : "Skriv in en giltig e-postadress",
                "CFORM_ERRORS_toLong" : "Texten måste vara kortare än 200 tecken",
                "CFORM_ERRORS_toShort" : "Texten bör vara minst 2 tecken lång",
                "CFORM_ERRORS_noOwner" : "Ägarens e-postadress har inte angetts",
                "CFORM_ERRORS_404" : "det gick inte att hitta tjänsten 404",
                "CFORM_ERRORS_main" : "det har uppstått ett fel",
                "CFORM_ERRORS_timeOut" : "begär timeout",

                "CFORM_eMAIL_title" : "Du har fått ett nytt meddelande: ",
                "CFORM_eMAIL_via" : "Via: ",
                "CFORM_eMAIL_details" : "Meddelandedetaljer: ",
                "CFORM_eMAIL_date" : "Skickat den:",
                "CFORM_eMAIL_tnx" : "Tack för att du använder Wix.com!",



                "CFORM_user_submitButtonLabel" : "Skicka",
                "CFORM_user_successMessage" : "Dina uppgifter skickades!",
                "CFORM_user_errorMessage" : "Ange en giltig e-post",
                "CFORM_user_validationErrorMessage" : "Fyll i alla obligatoriska fält.",



                "CFORM_FIELDS_emailTo" : "Skicka e-post till (måste anges):",
                "CFORM_FIELDS_bccTo" : "Skicka hemlig kopia till:",
                "CFORM_FIELDS_name" : "Namn",
                "CFORM_FIELDS_email" : "E-post",
                "CFORM_FIELDS_phone" : "Telefon",
                "CFORM_FIELDS_subject" : "Ämne",
                "CFORM_FIELDS_message" : "Meddelande",
                "CFORM_FIELDS_address" : "Adress",
                "CFORM_FIELDS_placeholder" : "Fältetikett",
                "CFORM_FIELDS_email_placeholder" : "Fältetikett: E-post",
                "CFORM_FIELDS_name_placeholder" : "Fältetikett: Namn",
                "CFORM_FIELDS_submitButtonLabel" : "Text för skicka-knapp",
                "CFORM_FIELDS_successMessage" : "Meddelande om slutförande",
                "CFORM_FIELDS_errorMessage" : "Felmeddelande för e-postfält",
                "CFORM_FIELDS_validationErrorMessage" : "Felmeddelande för obligatoriska fält"
            },

            no: {


                "CFORM_ERRORS_badMail" : "Angi en gyldig e-postadresse",
                "CFORM_ERRORS_toLong" : "Teksten kan ikke inneholde mer enn 200 tegn",
                "CFORM_ERRORS_toShort" : "Teksten må inneholde minst 2 tegn",
                "CFORM_ERRORS_noOwner" : "Eierens e-postadresse er ikke angitt",
                "CFORM_ERRORS_404" : "HTTP 404 (ikke funnet)",
                "CFORM_ERRORS_main" : "det oppsto en feil",
                "CFORM_ERRORS_timeOut" : "forespørsel tidsavbrutt",

                "CFORM_eMAIL_title" : "Du har fått en ny melding: ",
                "CFORM_eMAIL_via" : "Via: ",
                "CFORM_eMAIL_details" : "Meldingsdetaljer: ",
                "CFORM_eMAIL_date" : "Sendt den:",
                "CFORM_eMAIL_tnx" : "Takk for at du bruker Wix.com!",

                "CFORM_user_submitButtonLabel" : "Send",
                "CFORM_user_successMessage" : "Opplysningene dine ble sendt!",
                "CFORM_user_errorMessage" : "Angi en gyldig e-postadresse",
                "CFORM_user_validationErrorMessage" : "Fyll ut alle obligatoriske felter.",


                "CFORM_FIELDS_emailTo" : "E-post til (obligatorisk):",
                "CFORM_FIELDS_bccTo" : "Blindkopi til:",
                "CFORM_FIELDS_name" : "Navn",

                "CFORM_FIELDS_email" : "E-post",
                "CFORM_FIELDS_phone" : "Telefon",
                "CFORM_FIELDS_subject" : "Emne",
                "CFORM_FIELDS_message" : "Melding",
                "CFORM_FIELDS_address" : "Adresse",
                "CFORM_FIELDS_placeholder" : "Feltetikett",
                "CFORM_FIELDS_email_placeholder" : "Etikett for e-postfeltet",
                "CFORM_FIELDS_name_placeholder" : "Etikett for navnfeltet",
                "CFORM_FIELDS_submitButtonLabel" : "Tekst på Send-knappen",
                "CFORM_FIELDS_successMessage" : "Vellykket-melding",
                "CFORM_FIELDS_errorMessage" : "Feilmelding for feltet E-post",
                "CFORM_FIELDS_validationErrorMessage" : "Feilmelding for obligatoriske felter"
            },

            da: {


                "CFORM_ERRORS_badMail" : "Indtast venligst en gyldig email adresse",
                "CFORM_ERRORS_toLong" : "Tekst skal være mindre end 200 tegn",
                "CFORM_ERRORS_toShort" : "Tekst bør være på mindst 2 tegn",
                "CFORM_ERRORS_noOwner" : "Ejer e-mailadresse ikke konfigureret",
                "CFORM_ERRORS_404" : "service ikke fundet 404",
                "CFORM_ERRORS_main" : "der er opstået en fejl",
                "CFORM_ERRORS_timeOut" : "Anmodning timeout",

                "CFORM_eMAIL_title" : "Du har en ny besked: ",
                "CFORM_eMAIL_via" : "Via: ",
                "CFORM_eMAIL_details" : "Besked detaljer: ",
                "CFORM_eMAIL_date" : "Sendt den:",
                "CFORM_eMAIL_tnx" : "Tak fordi du bruger Wix.com!",


                "CFORM_user_submitButtonLabel" : "Send",
                "CFORM_user_successMessage" : "Dine oplysninger blev succesfuldt sendt!",
                "CFORM_user_errorMessage" : "Angiv venligst en gyldig email",
                "CFORM_user_validationErrorMessage" : "Venligst udfyld alle obligatoriske felter.",

                "CFORM_FIELDS_emailTo" : "Email til (påkrævet):",
                "CFORM_FIELDS_bccTo" : "Email BCC:",
                "CFORM_FIELDS_name" : "Navn",
                "CFORM_FIELDS_email" : "Email",
                "CFORM_FIELDS_phone" : "Telefon",
                "CFORM_FIELDS_subject" : "Emne",
                "CFORM_FIELDS_message" : "Besked",
                "CFORM_FIELDS_address" : "Adresse",
                "CFORM_FIELDS_placeholder" : "Felt label",
                "CFORM_FIELDS_email_placeholder" : "Email felt label",
                "CFORM_FIELDS_name_placeholder" : "Navn felt label",
                "CFORM_FIELDS_submitButtonLabel" : "Send knap tekst",
                "CFORM_FIELDS_successMessage" : "Succes besked",
                "CFORM_FIELDS_errorMessage" : "Fejlmeddelelse for email felt",
                "CFORM_FIELDS_validationErrorMessage" : "Fejlmeddelelse for obligatoriske felter"



            }

        },
        _isComponentNew: true,
        _isMail: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        _sizeLimits: {
            minW: 180,
            minH: 180,
            maxW: 980,
            maxH: 1024
        },
        EDITOR_META_DATA:{
            general:{
                settings    : true,
                design      : true
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.states({
        dir: ['left', 'right'],
        mob: ['mobile', 'desktop'],
        visibility: ['hidden', 'visible']
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);
            this._metaSiteId = null;
            this._resizableSides = [Constants.BaseComponent.ResizeSides.LEFT, Constants.BaseComponent.ResizeSides.RIGHT];

            this._restClient = new this.imports.WixRESTClient();
            this._dataKeysOveriddenByUser = {};
            this._dataKeyAllowedToTranslate = {
                submitButtonLabel: true,
                successMessage: true,
                errorMessage: true,
                validationErrorMessage: true,
                nameFieldLabel: true,
                emailFieldLabel: true,
                phoneFieldLabel: true,
                subjectFieldLabel: true,
                messageFieldLabel: true,
                addressFieldLabel: true
            };
        },


        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations,
                isMobile,
                textDirection,
                dataChange;

            if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this._firstRender();
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.DATA_CHANGE])) {
                dataChange = invalidations._invalidations.dataChange;
                this._handleKeyTranslations(dataChange);
            }

            if (!this.resources.W.Viewer.isSiteReady()) {
                this.invalidate('siteNotReady');
                return;
            }

            isMobile = this.resources.W.Config.env.isViewingSecondaryDevice();
            textDirection = this.getDataItem().get('textDirection');

            this.setState(isMobile ? 'mobile' : 'desktop', 'mob');
            this.setState(textDirection, 'dir');
            this._renderForm();
            this.setHeight(this._skinParts.wrapper.clientHeight);

        },

        isPartiallyFunctionalInStaticHtml: function(){
            return true;
        },

        _preventKeyTranslation: function (key) {
            this._dataKeysOveriddenByUser[key] = true;
        },

        _canKeyBeTranslated: function (key) {
            return this._dataKeyAllowedToTranslate[key];
        },

        _isKeyOveriddenByUser: function (key) {
            return this._dataKeysOveriddenByUser[key];
        },

        _handleKeyTranslations: function (dataChange) {
            var changedKey = "",
                that = this;

            dataChange.forEach(function (element, index, array) {
                changedKey = element.field;
                if (that._canKeyBeTranslated(changedKey)) {
                    that._preventKeyTranslation(changedKey);
                }
            });
        },

        _firstRender: function () {
            var config = this.resources.W.Config;

            this._isComponentNew = this._isPreset();
//            this._restClient = new this.imports.WixRESTClient();
            this._setDictionary(config.getLanguage(), config.isPremiumUser());

            if (this.resources.W.Config.env.$isPublicViewerFrame) {
                return;
            }

            this._decryptEmails();
            this._handleMissingEmail();
            this._translatePlaceholdersIfComponentIsNew();
        },

        _handleMissingEmail: function () {
            var data = this.getDataItem(),
                emailFromData = data.get('toEmailAddress'),
                emailFromConfig,
                isSuffix = function (str, suffixToCheck) {
                    return str.indexOf(suffixToCheck) === str.length - suffixToCheck.length;
                },
                isWixEmail = function (email) {
                    return email && isSuffix(email, "@wix.com");
                };

            if (emailFromData) {
                return;
            }

            emailFromConfig = this.resources.W.Config.getUserEmail();
            if (!isWixEmail(emailFromConfig)) {
                data.set('toEmailAddress', emailFromConfig);
                this.setComponentProperty('useCookie', true);
            }
        },

        _setDictionary: function (language, isPremium) {
            var keys = this.langKeys[language];

            this.lingo = {
                err_404: keys.CFORM_ERRORS_404,
                err_main: keys.CFORM_ERRORS_main,
                err_noOwner: keys.CFORM_ERRORS_noOwner,
                err_timeOut: keys.CFORM_ERRORS_timeOut,
                msg_date: keys.CFORM_eMAIL_date,
                msg_details: keys.CFORM_eMAIL_details,
                msg_title: keys.CFORM_eMAIL_title,
                msg_tnx: isPremium ? "Thank you!" : keys.CFORM_eMAIL_tnx,
                msg_subj: isPremium ? "New message via your website, from " : "New message via your Wix website, from ",
                msg_via: keys.CFORM_eMAIL_via,
                sending: "…",
                nameFieldLabel: keys.CFORM_FIELDS_name,
                phoneFieldLabel: keys.CFORM_FIELDS_phone,
                subjectFieldLabel: keys.CFORM_FIELDS_subject,
                emailFieldLabel: keys.CFORM_FIELDS_email,
                messageFieldLabel: keys.CFORM_FIELDS_message,
                addressFieldLabel: keys.CFORM_FIELDS_address,
                errorMessage: keys.CFORM_user_errorMessage,
                submitButtonLabel: keys.CFORM_user_submitButtonLabel,
                successMessage: keys.CFORM_user_successMessage,
                validationErrorMessage: keys.CFORM_user_validationErrorMessage
            };
        },

        _translatePlaceholdersIfComponentIsNew: function () {
            if (this._isComponentNew) {
                this._translateUserMsg();
            }
        },

        _translateUserMsg: function () {
            var data = this.getDataItem();

            this._translateIfAllowed(data, 'submitButtonLabel', 'Send');
            this._translateIfAllowed(data, 'successMessage', 'Your details were sent successfully!');
            this._translateIfAllowed(data, 'errorMessage', 'Please provide a valid email');
            this._translateIfAllowed(data, 'validationErrorMessage', 'Please fill in all required fields.');

            this._translateIfAllowed(data, 'nameFieldLabel', 'Name');
            this._translateIfAllowed(data, 'emailFieldLabel', 'Email');
            this._translateIfAllowed(data, 'phoneFieldLabel', 'Phone');
            this._translateIfAllowed(data, 'subjectFieldLabel', 'Subject');
            this._translateIfAllowed(data, 'messageFieldLabel', 'Message');
            this._translateIfAllowed(data, 'addressFieldLabel', 'Address');
        },

        _translateIfAllowed: function (data, dataKey, defaultValue) {
            if (this._canKeyBeTranslated(dataKey) && !this._isKeyOveriddenByUser(dataKey)) {
                data.set(dataKey, this.lingo[dataKey] || defaultValue);
            }
        },

        _isPreset: function () {
            return this.getDataItem().getMeta('isPreset');
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

        _renderForm: function () {
            if (this._skinParts.submit) {
                this._skinParts.submit.set('text', this._data.get('submitButtonLabel')).addEvent('click', this._onSubmit);
            }
            var inputs = _.pick(this._skinParts, this.isInput, this);
            _.each(inputs, function (input, key) {
                this._doUpdateInput(key, input);
            }, this);

            this.setState('visible');
        },

        _getInputData: function (spart) {
            var key = _.isElement(spart) ? spart.getAttribute('skinpart') + 'FieldLabel' : spart + 'FieldLabel';
            return {
                value: this._data.get(key),
                displayed: this.getComponentProperty('hidden_' + key),
                required: this.getComponentProperty('required_' + key)
            };
        },

        _doUpdateInput: function (key, elm) {
            var input = elm || this._skinParts[key],
                data = this._getInputData(key);

            this.setInput(input, data);
            if (this._skin.hidePlaceholders) {
                this.setLabel(this._skinParts['label_' + key], data);
            }
        },

        disableSubmit: function () {
            this._skinParts.submit.setAttribute('disabled', 'disabled');
        },

        enableSubmit: function () {
            this._skinParts.submit.removeAttribute('disabled');
        },

        // there are currently no tests for 'activateFallback', therefore, '_sendMail' is always expected to have been called with 'true' as a third parameter in the specs.
        _sendMail: function (url, data, tryAgain) {
            this.messageSent = false;
            this.disableSubmit();
            this._restClient.post(url, data, {
                "onSuccess": function () {
                    this._showMessage(this._data.get('successMessage'));
                    this.messageSent = true;
                    this._cleanForm();
                    this.sendBiEvent(wixEvents.FORM_SUBMIT_SUCCESS, {c1: this.getID(), c2: this.className});
                    this.enableSubmit();
                }.bind(this),
                "onError": function (response) {
                    this.response = response;
                    if(tryAgain) {
                        this.sendBiError(wixErrors.CONTACT_FORM_SUBMIT_FAILURE, 'wysiwyg.viewer.components.ContactForm', '_sendMail', {response: this.response});
                    } else {
                        this._showMessage(this.lingo['err_main'], 1);
                        this.sendBiError(wixErrors.CONTACT_FORM_SUBMIT_FINAL_FALLBACK, 'wysiwyg.viewer.components.ContactForm', '_sendMail', {response: this.response});
                    }
                    this.enableSubmit();
                }.bind(this)
            });
        },

        _reportActivity: function (fields) {
            this.resources.W.Commands.executeCommand('WViewerCommands.Activity.Report', {
                name: 'ContactForm',
                fields: fields
            });
        },

        _onSubmit: function () {
            var dataItem = this.getDataItem(),
                toMail = dataItem.get('toEmailAddress'),
                bccMail = dataItem.get('bccEmailAddress'),
                fields,
                htmlMessage,
                formattedData;

            if (!toMail || toMail === 'a33012eff368a577d48f52f310c92140') {//no email, or encoded empty string
                this._showMessage(this.lingo['err_noOwner'], true);
                return;
            }

            if (!this._isValid()) {
                return;
            }

            fields = this.preFormatFields();
            htmlMessage = this.getMsgTemplate(fields.forSend, this.lingo);
            formattedData = this._formatData(fields.forReport, htmlMessage, toMail, bccMail);

            this._showMessage(this.lingo['sending']);

            this._sendMail(this.getMailServerUrl(), formattedData, true);
            this.sendBiEvent(wixEvents.FORM_SUBMIT, {c1: this.getID(), c2: this.className});
            this.activateFallback(this.getFallbackMailServerUrl(), formattedData);

            if (this.resources.W.Config.env.$isPublicViewerFrame) {
                this._reportActivity(fields.forReport);
            }
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


        _formatData: function (fields, html, to, bcc) {
            var inputValue = function (key) {
                var val = fields[key];
                return !!val ? val : 'n/a';
            };

            return {
                'to': [
                    {
                        address: to || 'n/a',
                        personal: to || 'n/a'
                    }
                ],
                'bcc': !!bcc ? [
                    {
                        address: bcc || 'n/a',
                        personal: bcc || 'n/a'
                    }
                ] : [],
                'cc': [],
                'from': {
                    address: inputValue('email'),
                    personal: inputValue('name')
                },
                'subject': this.lingo['msg_subj'] + inputValue('email'),
                'metaSiteId': rendererModel.metaSiteId || 'dc853130-4fb2-464f-878d-3b6667dc4f97',
                'htmlMessage': html,
                'plainTextMessage': inputValue('message')
            };
        },

        _showMessage: function (msg, error) {
            this._skinParts.notifications.set('text', msg);
            this._skinParts.notifications.className = error ? 'error' : 'success';
        },

        _cleanForm: function () {
            var poly = this.needsPoly();
            _.each(this._skinParts, function (input) {
                if (!this.isInput(input)) {
                    return;
                }
                $(input).removeClass('error');
                input.value = '';
                if (poly) {
                    input.focus();
                }
            }, this);
        },

        _isValid: function () {
            var ok = true,
                bad;

            if (!this._isMail.test(this._skinParts.email.value.replace(/^\s+|\s+$/g, ''))) {
                $(this._skinParts.email).addClass('error');
                this._showMessage(this._data.get('errorMessage'), 1);
                return !ok;
            } else {
                $(this._skinParts.email).removeClass('error');
            }

            bad = _.pick(this._skinParts, this.getEmptyInputs, this);

            if (_.isEmpty(bad)) {
                _.each(this._skinParts, function (input) {
                    $(input).removeClass('error');
                });
            } else {
                ok = false;
                _.each(bad, function (input) {
                    $(input).addClass('error');
                });
                this._showMessage(this._data.get('validationErrorMessage'), 1);
            }
            return ok;
        },

        /**************************************
         *  DecryptContactFormEmail functions *
         **************************************/

        _decryptEmails: function () {
            var serviceBaseUrl = this._getServiceBaseUrl();  //Decrypt service URL
            var siteId = W.Config.getSiteId();
            this.serviceBaseUrl = serviceBaseUrl.replace('{{siteId}}', siteId);

            var dataFieldNames = ['toEmailAddress', 'bccEmailAddress'];  //emails to decrypt
            _.forEach(dataFieldNames, function (dataFieldName) {
                var mail = this._data.get(dataFieldName);
                if (!this._isEmpty(mail) && !this._isDecryptedEmail(mail.trim())) {
                    this._doDecryptRequest(dataFieldName, mail);
                }
            }, this);
        },

        _doDecryptRequest: function (dataFieldName, encMail) {
            var params = {};
            var absoluteUrl = this.serviceBaseUrl.replace('{{mail}}', encMail);
            var callbacks = {
                "onSuccess": this._getSuccessCallback(dataFieldName),
                "onError": this._getErrorCallback(dataFieldName)
            };

            this._restClient.get(absoluteUrl, params, callbacks);
        },

        //Generates a scoped success callback with (with dataFieldName)
        _getSuccessCallback: function (dataFieldName) {
            return function (response) {
                if (response.email) {
                    this._data.set(dataFieldName, response.email);  //Set the decrypted mail
                } else {
                    this._sendError(dataFieldName, 'Server returned success but no email field in response');
                }
            }.bind(this);
        },

        //Generates a scoped error callback with (with dataFieldName)
        _getErrorCallback: function (dataFieldName) {
            return function (response) {
                this._data.set(dataFieldName, '');  //Delete the email field
                this._sendError(dataFieldName, response);
            }.bind(this);
        },

        _getServiceBaseUrl: function () {
            var topology = window.location.protocol + '//' + window.location.host;
            var serviceEndPoint = '/html/email/decrypt/{{mail}}/{{siteId}}';
            return (topology + serviceEndPoint);
        },

        _sendError: function (dataFieldName, errMsg) {
            var logErrorParams = {
                dataFieldName: dataFieldName,
                originalMail: this._data.get(dataFieldName),
                errorMsg: errMsg
            };

            LOG.reportError(
                wixErrors.CONTACT_FORM_EMAIL_DECRYPT_FAILURE,
                'wysiwyg.viewer.components.ContactForm',
                '_sendError',
                JSON.stringify(logErrorParams)
            );
        },

        _isEmpty: function (str) {
            return (!str);
        },

        _isDecryptedEmail: function (str) {
            return (str.match(/^(([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+|\s*)$/)) ? true : false;
        }
    });
});

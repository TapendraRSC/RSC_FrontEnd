'use client';
import React, { useState, useRef, useEffect } from "react";
import {
    FieldErrors,
    Path,
    RegisterOptions,
    UseFormClearErrors,
    UseFormSetValue,
    useWatch,
    Control,
} from "react-hook-form";

interface Country {
    name: string;
    dial_code: string;
    code: string;
    flag: string;
}

interface FormPhoneInputProps<T extends Record<string, any>> {
    name: Path<T>;
    label: string;
    placeholder?: string;
    required?: boolean;
    validation?: any;
    errors: FieldErrors<T>;
    clearErrors: UseFormClearErrors<T>;
    setValue: UseFormSetValue<T>;
    control: Control<T>;
    className?: string;
    disabled?: boolean;
    maxLength?: number;
}

const countriesData: Country[] = [
    { name: "Afghanistan", dial_code: "+93", code: "AF", flag: "🇦🇫" },
    { name: "Albania", dial_code: "+355", code: "AL", flag: "🇦🇱" },
    { name: "Algeria", dial_code: "+213", code: "DZ", flag: "🇩🇿" },
    { name: "American Samoa", dial_code: "+1684", code: "AS", flag: "🇦🇸" },
    { name: "Andorra", dial_code: "+376", code: "AD", flag: "🇦🇩" },
    { name: "Angola", dial_code: "+244", code: "AO", flag: "🇦🇴" },
    { name: "Anguilla", dial_code: "+1264", code: "AI", flag: "🇦🇮" },
    { name: "Antarctica", dial_code: "+672", code: "AQ", flag: "🇦🇶" },
    { name: "Antigua and Barbuda", dial_code: "+1268", code: "AG", flag: "🇦🇬" },
    { name: "Argentina", dial_code: "+54", code: "AR", flag: "🇦🇷" },
    { name: "Armenia", dial_code: "+374", code: "AM", flag: "🇦🇲" },
    { name: "Aruba", dial_code: "+297", code: "AW", flag: "🇦🇼" },
    { name: "Australia", dial_code: "+61", code: "AU", flag: "🇦🇺" },
    { name: "Austria", dial_code: "+43", code: "AT", flag: "🇦🇹" },
    { name: "Azerbaijan", dial_code: "+994", code: "AZ", flag: "🇦🇿" },
    { name: "Bahamas", dial_code: "+1242", code: "BS", flag: "🇧🇸" },
    { name: "Bahrain", dial_code: "+973", code: "BH", flag: "🇧🇭" },
    { name: "Bangladesh", dial_code: "+880", code: "BD", flag: "🇧🇩" },
    { name: "Barbados", dial_code: "+1246", code: "BB", flag: "🇧🇧" },
    { name: "Belarus", dial_code: "+375", code: "BY", flag: "🇧🇾" },
    { name: "Belgium", dial_code: "+32", code: "BE", flag: "🇧🇪" },
    { name: "Belize", dial_code: "+501", code: "BZ", flag: "🇧🇿" },
    { name: "Benin", dial_code: "+229", code: "BJ", flag: "🇧🇯" },
    { name: "Bermuda", dial_code: "+1441", code: "BM", flag: "🇧🇲" },
    { name: "Bhutan", dial_code: "+975", code: "BT", flag: "🇧🇹" },
    { name: "Bolivia", dial_code: "+591", code: "BO", flag: "🇧🇴" },
    { name: "Bosnia and Herzegovina", dial_code: "+387", code: "BA", flag: "🇧🇦" },
    { name: "Botswana", dial_code: "+267", code: "BW", flag: "🇧🇼" },
    { name: "Brazil", dial_code: "+55", code: "BR", flag: "🇧🇷" },
    { name: "British Indian Ocean Territory", dial_code: "+246", code: "IO", flag: "🇮🇴" },
    { name: "Brunei Darussalam", dial_code: "+673", code: "BN", flag: "🇧🇳" },
    { name: "Bulgaria", dial_code: "+359", code: "BG", flag: "🇧🇬" },
    { name: "Burkina Faso", dial_code: "+226", code: "BF", flag: "🇧🇫" },
    { name: "Burundi", dial_code: "+257", code: "BI", flag: "🇧🇮" },
    { name: "Cambodia", dial_code: "+855", code: "KH", flag: "🇰🇭" },
    { name: "Cameroon", dial_code: "+237", code: "CM", flag: "🇨🇲" },
    { name: "Canada", dial_code: "+1", code: "CA", flag: "🇨🇦" },
    { name: "Cape Verde", dial_code: "+238", code: "CV", flag: "🇨🇻" },
    { name: "Cayman Islands", dial_code: "+1345", code: "KY", flag: "🇰🇾" },
    { name: "Central African Republic", dial_code: "+236", code: "CF", flag: "🇨🇫" },
    { name: "Chad", dial_code: "+235", code: "TD", flag: "🇹🇩" },
    { name: "Chile", dial_code: "+56", code: "CL", flag: "🇨🇱" },
    { name: "China", dial_code: "+86", code: "CN", flag: "🇨🇳" },
    { name: "Christmas Island", dial_code: "+61", code: "CX", flag: "🇨🇽" },
    { name: "Cocos (Keeling) Islands", dial_code: "+61", code: "CC", flag: "🇨🇨" },
    { name: "Colombia", dial_code: "+57", code: "CO", flag: "🇨🇴" },
    { name: "Comoros", dial_code: "+269", code: "KM", flag: "🇰🇲" },
    { name: "Congo", dial_code: "+242", code: "CG", flag: "🇨🇬" },
    { name: "Congo, Democratic Republic", dial_code: "+243", code: "CD", flag: "🇨🇩" },
    { name: "Cook Islands", dial_code: "+682", code: "CK", flag: "🇨🇰" },
    { name: "Costa Rica", dial_code: "+506", code: "CR", flag: "🇨🇷" },
    { name: "Cote D'Ivoire", dial_code: "+225", code: "CI", flag: "🇨🇮" },
    { name: "Croatia", dial_code: "+385", code: "HR", flag: "🇭🇷" },
    { name: "Cuba", dial_code: "+53", code: "CU", flag: "🇨🇺" },
    { name: "Cyprus", dial_code: "+357", code: "CY", flag: "🇨🇾" },
    { name: "Czech Republic", dial_code: "+420", code: "CZ", flag: "🇨🇿" },
    { name: "Denmark", dial_code: "+45", code: "DK", flag: "🇩🇰" },
    { name: "Djibouti", dial_code: "+253", code: "DJ", flag: "🇩🇯" },
    { name: "Dominica", dial_code: "+1767", code: "DM", flag: "🇩🇲" },
    { name: "Dominican Republic", dial_code: "+1809", code: "DO", flag: "🇩🇴" },
    { name: "Ecuador", dial_code: "+593", code: "EC", flag: "🇪🇨" },
    { name: "Egypt", dial_code: "+20", code: "EG", flag: "🇪🇬" },
    { name: "El Salvador", dial_code: "+503", code: "SV", flag: "🇸🇻" },
    { name: "Equatorial Guinea", dial_code: "+240", code: "GQ", flag: "🇬🇶" },
    { name: "Eritrea", dial_code: "+291", code: "ER", flag: "🇪🇷" },
    { name: "Estonia", dial_code: "+372", code: "EE", flag: "🇪🇪" },
    { name: "Ethiopia", dial_code: "+251", code: "ET", flag: "🇪🇹" },
    { name: "Falkland Islands (Malvinas)", dial_code: "+500", code: "FK", flag: "🇫🇰" },
    { name: "Faroe Islands", dial_code: "+298", code: "FO", flag: "🇫🇴" },
    { name: "Fiji", dial_code: "+679", code: "FJ", flag: "🇫🇯" },
    { name: "Finland", dial_code: "+358", code: "FI", flag: "🇫🇮" },
    { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷" },
    { name: "French Guiana", dial_code: "+594", code: "GF", flag: "🇬🇫" },
    { name: "French Polynesia", dial_code: "+689", code: "PF", flag: "🇵🇫" },
    { name: "Gabon", dial_code: "+241", code: "GA", flag: "🇬🇦" },
    { name: "Gambia", dial_code: "+220", code: "GM", flag: "🇬🇲" },
    { name: "Georgia", dial_code: "+995", code: "GE", flag: "🇬🇪" },
    { name: "Germany", dial_code: "+49", code: "DE", flag: "🇩🇪" },
    { name: "Ghana", dial_code: "+233", code: "GH", flag: "🇬🇭" },
    { name: "Gibraltar", dial_code: "+350", code: "GI", flag: "🇬🇮" },
    { name: "Greece", dial_code: "+30", code: "GR", flag: "🇬🇷" },
    { name: "Greenland", dial_code: "+299", code: "GL", flag: "🇬🇱" },
    { name: "Grenada", dial_code: "+1473", code: "GD", flag: "🇬🇩" },
    { name: "Guadeloupe", dial_code: "+590", code: "GP", flag: "🇬🇵" },
    { name: "Guam", dial_code: "+1671", code: "GU", flag: "🇬🇺" },
    { name: "Guatemala", dial_code: "+502", code: "GT", flag: "🇬🇹" },
    { name: "Guernsey", dial_code: "+44", code: "GG", flag: "🇬🇬" },
    { name: "Guinea", dial_code: "+224", code: "GN", flag: "🇬🇳" },
    { name: "Guinea-Bissau", dial_code: "+245", code: "GW", flag: "🇬🇼" },
    { name: "Guyana", dial_code: "+592", code: "GY", flag: "🇬🇾" },
    { name: "Haiti", dial_code: "+509", code: "HT", flag: "🇭🇹" },
    { name: "Holy See (Vatican City State)", dial_code: "+379", code: "VA", flag: "🇻🇦" },
    { name: "Honduras", dial_code: "+504", code: "HN", flag: "🇭🇳" },
    { name: "Hong Kong", dial_code: "+852", code: "HK", flag: "🇭🇰" },
    { name: "Hungary", dial_code: "+36", code: "HU", flag: "🇭🇺" },
    { name: "Iceland", dial_code: "+354", code: "IS", flag: "🇮🇸" },
    { name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳" },
    { name: "Indonesia", dial_code: "+62", code: "ID", flag: "🇮🇩" },
    { name: "Iran", dial_code: "+98", code: "IR", flag: "🇮🇷" },
    { name: "Iraq", dial_code: "+964", code: "IQ", flag: "🇮🇶" },
    { name: "Ireland", dial_code: "+353", code: "IE", flag: "🇮🇪" },
    { name: "Isle of Man", dial_code: "+44", code: "IM", flag: "🇮🇲" },
    { name: "Israel", dial_code: "+972", code: "IL", flag: "🇮🇱" },
    { name: "Italy", dial_code: "+39", code: "IT", flag: "🇮🇹" },
    { name: "Jamaica", dial_code: "+1876", code: "JM", flag: "🇯🇲" },
    { name: "Japan", dial_code: "+81", code: "JP", flag: "🇯🇵" },
    { name: "Jersey", dial_code: "+44", code: "JE", flag: "🇯🇪" },
    { name: "Jordan", dial_code: "+962", code: "JO", flag: "🇯🇴" },
    { name: "Kazakhstan", dial_code: "+7", code: "KZ", flag: "🇰🇿" },
    { name: "Kenya", dial_code: "+254", code: "KE", flag: "🇰🇪" },
    { name: "Kiribati", dial_code: "+686", code: "KI", flag: "🇰🇮" },
    { name: "Korea Democratic People's Republic of", dial_code: "+850", code: "KP", flag: "🇰🇵" },
    { name: "Korea Republic of South Korea", dial_code: "+82", code: "KR", flag: "🇰🇷" },
    { name: "Kosovo", dial_code: "+383", code: "XK", flag: "🇽🇰" },
    { name: "Kuwait", dial_code: "+965", code: "KW", flag: "🇰🇼" },
    { name: "Kyrgyzstan", dial_code: "+996", code: "KG", flag: "🇰🇬" },
    { name: "Laos", dial_code: "+856", code: "LA", flag: "🇱🇦" },
    { name: "Latvia", dial_code: "+371", code: "LV", flag: "🇱🇻" },
    { name: "Lebanon", dial_code: "+961", code: "LB", flag: "🇱🇧" },
    { name: "Lesotho", dial_code: "+266", code: "LS", flag: "🇱🇸" },
    { name: "Liberia", dial_code: "+231", code: "LR", flag: "🇱🇷" },
    { name: "Libyan Arab Jamahiriya", dial_code: "+218", code: "LY", flag: "🇱🇾" },
    { name: "Liechtenstein", dial_code: "+423", code: "LI", flag: "🇱🇮" },
    { name: "Lithuania", dial_code: "+370", code: "LT", flag: "🇱🇹" },
    { name: "Luxembourg", dial_code: "+352", code: "LU", flag: "🇱🇺" },
    { name: "Macao", dial_code: "+853", code: "MO", flag: "🇲🇴" },
    { name: "Macedonia", dial_code: "+389", code: "MK", flag: "🇲🇰" },
    { name: "Madagascar", dial_code: "+261", code: "MG", flag: "🇲🇬" },
    { name: "Malawi", dial_code: "+265", code: "MW", flag: "🇲🇼" },
    { name: "Malaysia", dial_code: "+60", code: "MY", flag: "🇲🇾" },
    { name: "Maldives", dial_code: "+960", code: "MV", flag: "🇲🇻" },
    { name: "Mali", dial_code: "+223", code: "ML", flag: "🇲🇱" },
    { name: "Malta", dial_code: "+356", code: "MT", flag: "🇲🇹" },
    { name: "Marshall Islands", dial_code: "+692", code: "MH", flag: "🇲🇭" },
    { name: "Martinique", dial_code: "+596", code: "MQ", flag: "🇲🇶" },
    { name: "Mauritania", dial_code: "+222", code: "MR", flag: "🇲🇷" },
    { name: "Mauritius", dial_code: "+230", code: "MU", flag: "🇲🇺" },
    { name: "Mayotte", dial_code: "+262", code: "YT", flag: "🇾🇹" },
    { name: "Mexico", dial_code: "+52", code: "MX", flag: "🇲🇽" },
    { name: "Micronesia", dial_code: "+691", code: "FM", flag: "🇫🇲" },
    { name: "Moldova", dial_code: "+373", code: "MD", flag: "🇲🇩" },
    { name: "Monaco", dial_code: "+377", code: "MC", flag: "🇲🇨" },
    { name: "Mongolia", dial_code: "+976", code: "MN", flag: "🇲🇳" },
    { name: "Montenegro", dial_code: "+382", code: "ME", flag: "🇲🇪" },
    { name: "Montserrat", dial_code: "+1664", code: "MS", flag: "🇲🇸" },
    { name: "Morocco", dial_code: "+212", code: "MA", flag: "🇲🇦" },
    { name: "Mozambique", dial_code: "+258", code: "MZ", flag: "🇲🇿" },
    { name: "Myanmar", dial_code: "+95", code: "MM", flag: "🇲🇲" },
    { name: "Namibia", dial_code: "+264", code: "NA", flag: "🇳🇦" },
    { name: "Nauru", dial_code: "+674", code: "NR", flag: "🇳🇷" },
    { name: "Nepal", dial_code: "+977", code: "NP", flag: "🇳🇵" },
    { name: "Netherlands", dial_code: "+31", code: "NL", flag: "🇳🇱" },
    { name: "Netherlands Antilles", dial_code: "+599", code: "AN", flag: "🇦🇳" },
    { name: "New Caledonia", dial_code: "+687", code: "NC", flag: "🇳🇨" },
    { name: "New Zealand", dial_code: "+64", code: "NZ", flag: "🇳🇿" },
    { name: "Nicaragua", dial_code: "+505", code: "NI", flag: "🇳🇮" },
    { name: "Niger", dial_code: "+227", code: "NE", flag: "🇳🇪" },
    { name: "Nigeria", dial_code: "+234", code: "NG", flag: "🇳🇬" },
    { name: "Niue", dial_code: "+683", code: "NU", flag: "🇳🇺" },
    { name: "Norfolk Island", dial_code: "+672", code: "NF", flag: "🇳🇫" },
    { name: "Northern Mariana Islands", dial_code: "+1670", code: "MP", flag: "🇲🇵" },
    { name: "Norway", dial_code: "+47", code: "NO", flag: "🇳🇴" },
    { name: "Oman", dial_code: "+968", code: "OM", flag: "🇴🇲" },
    { name: "Pakistan", dial_code: "+92", code: "PK", flag: "🇵🇰" },
    { name: "Palau", dial_code: "+680", code: "PW", flag: "🇵🇼" },
    { name: "Palestinian Territory, Occupied", dial_code: "+970", code: "PS", flag: "🇵🇸" },
    { name: "Panama", dial_code: "+507", code: "PA", flag: "🇵🇦" },
    { name: "Papua New Guinea", dial_code: "+675", code: "PG", flag: "🇵🇬" },
    { name: "Paraguay", dial_code: "+595", code: "PY", flag: "🇵🇾" },
    { name: "Peru", dial_code: "+51", code: "PE", flag: "🇵🇪" },
    { name: "Philippines", dial_code: "+63", code: "PH", flag: "🇵🇭" },
    { name: "Pitcairn", dial_code: "+872", code: "PN", flag: "🇵🇳" },
    { name: "Poland", dial_code: "+48", code: "PL", flag: "🇵🇱" },
    { name: "Portugal", dial_code: "+351", code: "PT", flag: "🇵🇹" },
    { name: "Puerto Rico", dial_code: "+1939", code: "PR", flag: "🇵🇷" },
    { name: "Qatar", dial_code: "+974", code: "QA", flag: "🇶🇦" },
    { name: "Romania", dial_code: "+40", code: "RO", flag: "🇷🇴" },
    { name: "Russia", dial_code: "+7", code: "RU", flag: "🇷🇺" },
    { name: "Rwanda", dial_code: "+250", code: "RW", flag: "🇷🇼" },
    { name: "Reunion", dial_code: "+262", code: "RE", flag: "🇷🇪" },
    { name: "Saint Barthelemy", dial_code: "+590", code: "BL", flag: "🇧🇱" },
    { name: "Saint Helena, Ascension and Tristan Da Cunha", dial_code: "+290", code: "SH", flag: "🇸🇭" },
    { name: "Saint Kitts and Nevis", dial_code: "+1869", code: "KN", flag: "🇰🇳" },
    { name: "Saint Lucia", dial_code: "+1758", code: "LC", flag: "🇱🇨" },
    { name: "Saint Martin", dial_code: "+590", code: "MF", flag: "🇲🇫" },
    { name: "Saint Pierre and Miquelon", dial_code: "+508", code: "PM", flag: "🇵🇲" },
    { name: "Saint Vincent and the Grenadines", dial_code: "+1784", code: "VC", flag: "🇻🇨" },
    { name: "Samoa", dial_code: "+685", code: "WS", flag: "🇼🇸" },
    { name: "San Marino", dial_code: "+378", code: "SM", flag: "🇸🇲" },
    { name: "Sao Tome and Principe", dial_code: "+239", code: "ST", flag: "🇸🇹" },
    { name: "Saudi Arabia", dial_code: "+966", code: "SA", flag: "🇸🇦" },
    { name: "Senegal", dial_code: "+221", code: "SN", flag: "🇸🇳" },
    { name: "Serbia", dial_code: "+381", code: "RS", flag: "🇷🇸" },
    { name: "Seychelles", dial_code: "+248", code: "SC", flag: "🇸🇨" },
    { name: "Sierra Leone", dial_code: "+232", code: "SL", flag: "🇸🇱" },
    { name: "Singapore", dial_code: "+65", code: "SG", flag: "🇸🇬" },
    { name: "Slovakia", dial_code: "+421", code: "SK", flag: "🇸🇰" },
    { name: "Slovenia", dial_code: "+386", code: "SI", flag: "🇸🇮" },
    { name: "Solomon Islands", dial_code: "+677", code: "SB", flag: "🇸🇧" },
    { name: "Somalia", dial_code: "+252", code: "SO", flag: "🇸🇴" },
    { name: "South Africa", dial_code: "+27", code: "ZA", flag: "🇿🇦" },
    { name: "South Sudan", dial_code: "+211", code: "SS", flag: "🇸🇸" },
    { name: "South Georgia and the South Sandwich Islands", dial_code: "+500", code: "GS", flag: "🇬🇸" },
    { name: "Spain", dial_code: "+34", code: "ES", flag: "🇪🇸" },
    { name: "Sri Lanka", dial_code: "+94", code: "LK", flag: "🇱🇰" },
    { name: "Sudan", dial_code: "+249", code: "SD", flag: "🇸🇩" },
    { name: "Suriname", dial_code: "+597", code: "SR", flag: "🇸🇷" },
    { name: "Svalbard and Jan Mayen", dial_code: "+47", code: "SJ", flag: "🇸🇯" },
    { name: "Swaziland", dial_code: "+268", code: "SZ", flag: "🇸🇿" },
    { name: "Sweden", dial_code: "+46", code: "SE", flag: "🇸🇪" },
    { name: "Switzerland", dial_code: "+41", code: "CH", flag: "🇨🇭" },
    { name: "Syrian Arab Republic", dial_code: "+963", code: "SY", flag: "🇸🇾" },
    { name: "Taiwan", dial_code: "+886", code: "TW", flag: "🇹🇼" },
    { name: "Tajikistan", dial_code: "+992", code: "TJ", flag: "🇹🇯" },
    { name: "Tanzania", dial_code: "+255", code: "TZ", flag: "🇹🇿" },
    { name: "Thailand", dial_code: "+66", code: "TH", flag: "🇹🇭" },
    { name: "Timor-Leste", dial_code: "+670", code: "TL", flag: "🇹🇱" },
    { name: "Togo", dial_code: "+228", code: "TG", flag: "🇹🇬" },
    { name: "Tokelau", dial_code: "+690", code: "TK", flag: "🇹🇰" },
    { name: "Tonga", dial_code: "+676", code: "TO", flag: "🇹🇴" },
    { name: "Trinidad and Tobago", dial_code: "+1868", code: "TT", flag: "🇹🇹" },
    { name: "Tunisia", dial_code: "+216", code: "TN", flag: "🇹🇳" },
    { name: "Turkey", dial_code: "+90", code: "TR", flag: "🇹🇷" },
    { name: "Turkmenistan", dial_code: "+993", code: "TM", flag: "🇹🇲" },
    { name: "Turks and Caicos Islands", dial_code: "+1649", code: "TC", flag: "🇹🇨" },
    { name: "Tuvalu", dial_code: "+688", code: "TV", flag: "🇹🇻" },
    { name: "Uganda", dial_code: "+256", code: "UG", flag: "🇺🇬" },
    { name: "Ukraine", dial_code: "+380", code: "UA", flag: "🇺🇦" },
    { name: "United Arab Emirates", dial_code: "+971", code: "AE", flag: "🇦🇪" },
    { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
    { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
    { name: "Uruguay", dial_code: "+598", code: "UY", flag: "🇺🇾" },
    { name: "Uzbekistan", dial_code: "+998", code: "UZ", flag: "🇺🇿" },
    { name: "Vanuatu", dial_code: "+678", code: "VU", flag: "🇻🇺" },
    { name: "Venezuela", dial_code: "+58", code: "VE", flag: "🇻🇪" },
    { name: "Vietnam", dial_code: "+84", code: "VN", flag: "🇻🇳" },
    { name: "Virgin Islands, British", dial_code: "+1284", code: "VG", flag: "🇻🇬" },
    { name: "Virgin Islands, U.S.", dial_code: "+1340", code: "VI", flag: "🇻🇮" },
    { name: "Wallis and Futuna", dial_code: "+681", code: "WF", flag: "🇼🇫" },
    { name: "Yemen", dial_code: "+967", code: "YE", flag: "🇾🇪" },
    { name: "Zambia", dial_code: "+260", code: "ZM", flag: "🇿🇲" },
    { name: "Zimbabwe", dial_code: "+263", code: "ZW", flag: "🇿🇼" },
];

const FormPhoneInput = <T extends Record<string, any>>({
    name,
    label,
    placeholder,
    required = false,
    validation = {},
    errors,
    clearErrors,
    setValue,
    control,
    className = "",
    disabled = false,
    maxLength = 10,
}: FormPhoneInputProps<T>) => {
    const [selectedCountry, setSelectedCountry] = useState<Country>(
        countriesData.find((c) => c.code === "IN") || countriesData[0]
    );
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [isInitialized, setIsInitialized] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const error = errors[name];

    // Use watch to get the current value of the field
    const fieldValue = useWatch({
        control,
        name,
    });

    // Initialize and parse existing values
    useEffect(() => {
        if (fieldValue && !isInitialized) {
            let parsedCountry = selectedCountry;
            let parsedPhoneNumber = "";

            // Check for space format: "+91 1234567890"
            const spaceMatch = fieldValue.match(/^(\+\d{1,4})\s+(.+)$/);
            // Check for dash format: "+91-1234567890"
            const dashMatch = fieldValue.match(/^(\+\d{1,4})-(.+)$/);

            if (spaceMatch) {
                const [, dialCode, phoneNumber] = spaceMatch;
                const country = countriesData.find((c) => c.dial_code === dialCode);
                if (country) {
                    parsedCountry = country;
                    parsedPhoneNumber = phoneNumber.replace(/\D/g, "");
                }
            } else if (dashMatch) {
                const [, dialCode, phoneNumber] = dashMatch;
                const country = countriesData.find((c) => c.dial_code === dialCode);
                if (country) {
                    parsedCountry = country;
                    parsedPhoneNumber = phoneNumber.replace(/\D/g, "");
                }
            }
            // Check for concatenated format: "+911234567890"
            else if (fieldValue.startsWith("+")) {
                let foundCountry = null;
                let phoneNumber = "";

                // Sort countries by dial code length (longest first) for accurate matching
                const sortedCountries = [...countriesData].sort((a, b) => b.dial_code.length - a.dial_code.length);

                for (const country of sortedCountries) {
                    if (fieldValue.startsWith(country.dial_code)) {
                        phoneNumber = fieldValue.substring(country.dial_code.length);
                        // Verify the remaining part looks like a valid phone number (at least 6 digits)
                        if (phoneNumber && phoneNumber.replace(/\D/g, "").length >= 6) {
                            foundCountry = country;
                            break;
                        }
                    }
                }

                if (foundCountry) {
                    parsedCountry = foundCountry;
                    parsedPhoneNumber = phoneNumber.replace(/\D/g, "");
                }
            } else {
                // No country code found, assume it's just the phone number
                parsedPhoneNumber = fieldValue.replace(/\D/g, "");
            }

            setSelectedCountry(parsedCountry);
            setInputValue(parsedPhoneNumber);
            setIsInitialized(true);
        }
    }, [fieldValue, isInitialized, selectedCountry]);

    // Updated validation rules
    const rules: RegisterOptions<T, Path<T>> = {
        ...validation,
        required: required ? validation.required || `${label} is required` : undefined,
        validate: {
            hasCountryCode: (value: string) => {
                if (!value) return true;
                const phoneNumberPart = value.split(" ")[1];
                if (!phoneNumberPart || phoneNumberPart.length === 0) return true;

                const hasValidFormat = /^\+\d{1,4}\s\d+$/.test(value);
                return hasValidFormat || "Phone number must include country code";
            },
            validLength: (value: string) => {
                if (!value) return true;
                const phoneNumberPart = value.split(" ")[1];
                if (!phoneNumberPart || phoneNumberPart.length === 0) return true;

                const digits = phoneNumberPart.replace(/\D/g, "");
                if (digits.length === 0) return true;

                return (
                    (digits.length >= 6 && digits.length <= 15) ||
                    "Please enter a complete phone number (6-15 digits)"
                );
            },
            ...validation.validate,
        },
    };

    const filteredCountries = countriesData.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.dial_code.includes(searchTerm) ||
            c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isDropdownOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isDropdownOpen]);

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        setIsDropdownOpen(false);
        setSearchTerm("");

        // Update the form value with new country code
        if (inputValue) {
            const fullNumber = `${country.dial_code} ${inputValue}`;
            setValue?.(name, fullNumber as any);
        } else {
            setValue?.(name, `${country.dial_code} ` as any);
        }

        if (error) clearErrors?.(name);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (error) clearErrors?.(name);

        let digits = e.target.value.replace(/\D/g, "");

        if (maxLength && digits.length > maxLength) {
            digits = digits.slice(0, maxLength);
        }

        setInputValue(digits);

        // Store with country code in form
        const fullNumber = digits ? `${selectedCountry.dial_code} ${digits}` : `${selectedCountry.dial_code} `;
        setValue?.(name, fullNumber as any);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
        setSearchTerm("");
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Responsive container */}
            <div className="flex flex-col sm:flex-row">
                {/* Country selector */}
                <div className="relative mb-2 sm:mb-0" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={toggleDropdown}
                        disabled={disabled}
                        className={`flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-l-lg sm:rounded-r-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors w-full sm:min-w-[140px] ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                            } ${error ? "border-red-500 dark:border-red-400" : ""}`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{selectedCountry.flag}</span>
                            <span className="font-medium text-sm">
                                {selectedCountry.dial_code}
                            </span>
                        </div>
                        <svg
                            className={`w-4 h-4 transition-transform flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 z-50 w-full sm:w-80 mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search countries..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                />
                            </div>
                            <div className="overflow-y-auto max-h-64">
                                {filteredCountries.length ? (
                                    filteredCountries.map((country) => (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => handleCountrySelect(country)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${selectedCountry.code === country.code
                                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                : "text-gray-900 dark:text-gray-100"
                                                }`}
                                        >
                                            <span className="text-lg flex-shrink-0">{country.flag}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{country.name}</div>
                                            </div>
                                            <span className="font-medium text-gray-500 dark:text-gray-400 text-sm flex-shrink-0">
                                                {country.dial_code}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No countries found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Phone input - NO register prop */}
                <input
                    type="tel"
                    value={inputValue}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-l-none sm:rounded-r-lg sm:border-l-0 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 transition-all ${error
                        ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                        : ""
                        } ${className}`}
                    placeholder={placeholder || "Enter phone number"}
                    disabled={disabled}
                />
            </div>

            {/* Error message */}
            {error && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {error.message as string}
                </p>
            )}
        </div>
    );
};

export default FormPhoneInput;
import React from "react";

const country = [
    {
        value: "+93",
        label: "+93",
        country: "Afghanistan",
        telLength: 9,
        iso2: "af",
        JsxElement: (
            <img src="https://flagcdn.com/af.svg" width="24" alt="Afghanistan" />
        ),
    },
    {
        value: "+355",
        label: "+355",
        country: "Albania",
        telLength: 9,
        iso2: "al",
        JsxElement: (
            <img src="https://flagcdn.com/al.svg" width="24" alt="Albania" />
        ),
    },
    {
        value: "+213",
        label: "+213",
        country: "Algeria",
        telLength: 9,
        iso2: "dz",
        JsxElement: (
            <img src="https://flagcdn.com/dz.svg" width="24" alt="Algeria" />
        ),
    },
    {
        value: "+1684",
        label: "+1684",
        country: "American Samoa",
        telLength: 7,
        iso2: "as",
        JsxElement: (
            <img src="https://flagcdn.com/as.svg" width="24" alt="American Samoa" />
        ),
    },
    {
        value: "+376",
        label: "+376",
        country: "Andorra",
        telLength: 6,
        iso2: "ad",
        JsxElement: (
            <img src="https://flagcdn.com/ad.svg" width="24" alt="Andorra " />
        ),
    },
    {
        value: "+244",
        label: "+244",
        country: "Angola",
        telLength: 9,
        iso2: "ao",
        JsxElement: (
            <img src="https://flagcdn.com/ao.svg" width="24" alt="Angola" />
        ),
    },
    {
        value: "+1264",
        label: "+1264",
        country: "Anguilla",
        telLength: 7,
        iso2: "ai",
        JsxElement: (
            <img src="https://flagcdn.com/ai.svg" width="24" alt="Anguilla" />
        ),
    },
    {
        value: "+672",
        label: "+672",
        country: "Antarctica",
        telLength: 6,
        iso2: "aq",
        JsxElement: (
            <img src="https://flagcdn.com/aq.svg" width="24" alt="Antarctica" />
        ),
    },
    {
        value: "+1268",
        label: "+1268",
        country: "Antigua And Barbuda",
        telLength: 7,
        iso2: "ag",
        JsxElement: (
            <img src="https://flagcdn.com/ag.svg" width="24" alt="Antigua And Barbuda" />
        ),
    },
    {
        value: "+54",
        label: "+54",
        country: "Argentina",
        telLength: 11,
        iso2: "ar",
        JsxElement: (
            <img src="https://flagcdn.com/ar.svg" width="24" alt="Argentina" />
        ),
    },
    {
        value: "+374",
        label: "+374",
        country: "Armenia",
        telLength: 8,
        iso2: "am",
        JsxElement: (
            <img src="https://flagcdn.com/am.svg" width="24" alt="Armenia" />
        ),
    },
    {
        value: "+297",
        label: "+297",
        country: "Aruba",
        telLength: 7,
        iso2: "aw",
        JsxElement: (
            <img src="https://flagcdn.com/aw.svg" width="24" alt="Aruba" />
        ),
    },
    {
        value: "+61",
        label: "+61",
        country: "Australia",
        telLength: 10,
        iso2: "au",
        JsxElement: (
            <img src="https://flagcdn.com/au.svg" width="24" alt="Australia" />
        ),
    },
    {
        value: "+43",
        label: "+43",
        country: "Austria",
        telLength: 12,
        iso2: "at",
        JsxElement: (
            <img src="https://flagcdn.com/at.svg" width="24" alt="Austria" />
        ),
    },
    {
        value: "+994",
        label: "+994",
        country: "Azerbaijan",
        telLength: 9,
        iso2: "az",
        JsxElement: (
            <img src="https://flagcdn.com/az.svg" width="24" alt="Azerbaijan" />
        ),
    },
    {
        value: "+1242",
        label: "+1242",
        country: "Bahamas",
        telLength: 10,
        iso2: "bs",
        JsxElement: (
            <img src="https://flagcdn.com/bs.svg" width="24" alt="Bahamas" />
        ),
    },
    {
        value: "+973",
        label: "+973",
        country: "Bahrain",
        telLength: 8,
        iso2: "bh",
        JsxElement: (
            <img src="https://flagcdn.com/bh.svg" width="24" alt="Bahrain" />
        ),
    },
    {
        value: "+880",
        label: "+880",
        country: "Bangladesh",
        telLength: 10,
        iso2: "bd",
        JsxElement: (
            <img src="https://flagcdn.com/bd.svg" width="24" alt="Bangladesh" />
        ),
    },
    {
        value: "+1246",
        label: "+1246",
        country: "Barbados",
        telLength: 10,
        iso2: "bb",
        JsxElement: (
            <img src="https://flagcdn.com/bb.svg" width="24" alt="Barbados" />
        ),
    },
    {
        value: "+375",
        label: "+375",
        country: "Belarus",
        telLength: 9,
        iso2: "by",
        JsxElement: (
            <img src="https://flagcdn.com/by.svg" width="24" alt="Belarus" />
        ),
    },
    {
        value: "+32",
        label: "+32",
        country: "Belgium",
        telLength: 10,
        iso2: "be",
        JsxElement: (
            <img src="https://flagcdn.com/be.svg" width="24" alt="Belgium" />
        ),
    },
    {
        value: "+501",
        label: "+501",
        country: "Belize",
        telLength: 7,
        iso2: "bz",
        JsxElement: (
            <img src="https://flagcdn.com/bz.svg" width="24" alt="Belize" />
        ),
    },
    {
        value: "+229",
        label: "+229",
        country: "Benin",
        telLength: 8,
        iso2: "bj",
        JsxElement: (
            <img src="https://flagcdn.com/bj.svg" width="24" alt="Benin" />
        ),
    },
    {
        value: "+1441",
        label: "+1441",
        country: "Bermuda",
        telLength: 7,
        iso2: "bm",
        JsxElement: (
            <img src="https://flagcdn.com/bm.svg" width="24" alt="Bermuda" />
        ),
    },
    {
        value: "+975",
        label: "+975",
        country: "Bhutan",
        telLength: 8,
        iso2: "bt",
        JsxElement: (
            <img src="https://flagcdn.com/bt.svg" width="24" alt="Bhutan" />
        ),
    },
    {
        value: "+591",
        label: "+591",
        country: "Bolivia",
        telLength: 8,
        iso2: "bo",
        JsxElement: (
            <img src="https://flagcdn.com/bo.svg" width="24" alt="Bolivia" />
        ),
    },
    {
        value: "+387",
        label: "+387",
        country: "Bosnia And Herzegovina",
        telLength: 8,
        iso2: "ba",
        JsxElement: (
            <img src="https://flagcdn.com/ba.svg" width="24" alt="Bosnia And Herzegovina" />
        ),
    },
    {
        value: "+267",
        label: "+267",
        country: "Botswana",
        telLength: 8,
        iso2: "bw",
        JsxElement: (
            <img src="https://flagcdn.com/bw.svg" width="24" alt="Botswana" />
        ),
    },
    {
        value: "+55",
        label: "+55",
        country: "Brazil",
        telLength: 11,
        iso2: "br",
        JsxElement: (
            <img src="https://flagcdn.com/br.svg" width="24" alt="Brazil" />
        ),
    },
    {
        value: "+246",
        label: "+246",
        country: "British Indian Ocean Territory",
        telLength: 7,
        iso2: "io",
        JsxElement: (
            <img src="https://flagcdn.com/io.svg" width="24" alt="British Indian Ocean Territory" />
        ),
    },
    {
        value: "+673",
        label: "+673",
        country: "Brunei Darussalam",
        telLength: 9,
        iso2: "bn",
        JsxElement: (
            <img src="https://flagcdn.com/bn.svg" width="24" alt="Brunei Darussalam" />
        ),
    },
    {
        value: "+359",
        label: "+359",
        country: "Bulgaria",
        telLength: 9,
        iso2: "bg",
        JsxElement: (
            <img src="https://flagcdn.com/bg.svg" width="24" alt="Bulgaria" />
        ),
    },
    {
        value: "+226",
        label: "+226",
        country: "Burkina Faso",
        telLength: 8,
        iso2: "bf",
        JsxElement: (
            <img src="https://flagcdn.com/bf.svg" width="24" alt="Burkina Faso" />
        ),
    },
    {
        value: "+257",
        label: "+257",
        country: "Burundi",
        telLength: 8,
        iso2: "bi",
        JsxElement: (
            <img src="https://flagcdn.com/bi.svg" width="24" alt="Burundi" />
        ),
    },
    {
        value: "+855",
        label: "+855",
        country: "Cambodia",
        telLength: 9,
        iso2: "kh",
        JsxElement: (
            <img src="https://flagcdn.com/kh.svg" width="24" alt="Cambodia" />
        ),
    },
    {
        value: "+237",
        label: "+237",
        country: "Cameroon",
        telLength: 9,
        iso2: "cm",
        JsxElement: (
            <img src="https://flagcdn.com/cm.svg" width="24" alt="Cameroon" />
        ),
    },
    {
        value: "+1",
        label: "+1",
        country: "Canada",
        telLength: 10,
        iso2: "ca",
        JsxElement: (
            <img src="https://flagcdn.com/ca.svg" width="24" alt="Canada" />
        ),
    },
    {
        value: "+238",
        label: "+238",
        country: "Cape Verde",
        telLength: 8,
        iso2: "cv",
        JsxElement: (
            <img src="https://flagcdn.com/cv.svg" width="24" alt="Cape Verde" />
        ),
    },
    {
        value: "+1345",
        label: "+1345",
        country: "Cayman Islands",
        telLength: 7,
        iso2: "ky",
        JsxElement: (
            <img src="https://flagcdn.com/ky.svg" width="24" alt="Cayman Islands" />
        ),
    },
    {
        value: "+236",
        label: "+236",
        country: "Central African Republic",
        telLength: 8,
        iso2: "cf",
        JsxElement: (
            <img src="https://flagcdn.com/cf.svg" width="24" alt="Central African Republic" />
        ),
    },
    {
        value: "+235",
        label: "+235",
        country: "Chad",
        telLength: 9,
        iso2: "td",
        JsxElement: (
            <img src="https://flagcdn.com/td.svg" width="24" alt="Chad" />
        ),
    },
    {
        value: "+56",
        label: "+56",
        country: "Chile",
        telLength: 11,
        iso2: "cl",
        JsxElement: (
            <img src="https://flagcdn.com/cl.svg" width="24" alt="Chile" />
        ),
    },
    {
        value: "+86",
        label: "+86",
        country: "China",
        telLength: 11,
        iso2: "cn",
        JsxElement: (
            <img src="https://flagcdn.com/cn.svg" width="24" alt="China" />
        ),
    },
    {
        value: "+57",
        label: "+57",
        country: "Colombia",
        telLength: 10,
        iso2: "co",
        JsxElement: (
            <img src="https://flagcdn.com/co.svg" width="24" alt="Colombia" />
        ),
    },
    {
        value: "+269",
        label: "+269",
        country: "Comoros",
        telLength: 7,
        iso2: "km",
        JsxElement: (
            <img src="https://flagcdn.com/km.svg" width="24" alt="Comoros" />
        ),
    },
    {
        value: "+242",
        label: "+242",
        country: "Congo",
        telLength: 8,
        iso2: "cg",
        JsxElement: (
            <img src="https://flagcdn.com/cg.svg" width="24" alt="Congo" />
        ),
    },
    {
        value: "+682",
        label: "+682",
        country: "Cook Islands",
        telLength: 6,
        iso2: "ck",
        JsxElement: (
            <img src="https://flagcdn.com/ck.svg" width="24" alt="Cook Islands" />
        ),
    },
    {
        value: "+506",
        label: "+506",
        country: "Costa Rica",
        telLength: 8,
        iso2: "cr",
        JsxElement: (
            <img src="https://flagcdn.com/cr.svg" width="24" alt="Costa Rica" />
        ),
    },
    {
        value: "+385",
        label: "+385",
        country: "Croatia",
        telLength: 9,
        iso2: "hr",
        JsxElement: (
            <img src="https://flagcdn.com/hr.svg" width="24" alt="Croatia" />
        ),
    },
    {
        value: "+53",
        label: "+53",
        country: "Cuba",
        telLength: 9,
        iso2: "cu",
        JsxElement: (
            <img src="https://flagcdn.com/cu.svg" width="24" alt="Cuba" />
        ),
    },
    {
        value: "+357",
        label: "+357",
        country: "Cyprus",
        telLength: 8,
        iso2: "cy",
        JsxElement: (
            <img src="https://flagcdn.com/cy.svg" width="24" alt="Cyprus" />
        ),
    },
    {
        value: "+420",
        label: "+420",
        country: "Czech Republic",
        telLength: 9,
        iso2: "cz",
        JsxElement: (
            <img src="https://flagcdn.com/cz.svg" width="24" alt="Czech Republic" />
        ),
    },
    {
        value: "+45",
        label: "+45",
        country: "Denmark",
        telLength: 8,
        iso2: "dk",
        JsxElement: (
            <img src="https://flagcdn.com/dk.svg" width="24" alt="Denmark" />
        ),
    },
    {
        value: "+253",
        label: "+253",
        country: "Djibouti",
        telLength: 8,
        iso2: "dj",
        JsxElement: (
            <img src="https://flagcdn.com/dj.svg" width="24" alt="Djibouti" />
        ),
    },
    {
        value: "+1767",
        label: "+1767",
        country: "Dominica",
        telLength: 7,
        iso2: "dm",
        JsxElement: (
            <img src="https://flagcdn.com/dm.svg" width="24" alt="Dominica" />
        ),
    },
    {
        value: "+1809",
        label: "+1809",
        country: "Dominican Republic",
        telLength: 10,
        iso2: "do",
        JsxElement: (
            <img src="https://flagcdn.com/do.svg" width="24" alt="Dominican Republic" />
        ),
    },
    {
        value: "+593",
        label: "+593",
        country: "Ecuador",
        telLength: 9,
        iso2: "ec",
        JsxElement: (
            <img src="https://flagcdn.com/ec.svg" width="24" alt="Ecuador" />
        ),
    },
    {
        value: "+20",
        label: "+20",
        country: "Egypt",
        telLength: 9,
        iso2: "eg",
        JsxElement: (
            <img src="https://flagcdn.com/eg.svg" width="24" alt="Egypt" />
        ),
    },
    {
        value: "+503",
        label: "+503",
        country: "El Salvador",
        telLength: 8,
        iso2: "sv",
        JsxElement: (
            <img src="https://flagcdn.com/sv.svg" width="24" alt="El Salvador" />
        ),
    },
    {
        value: "+240",
        label: "+240",
        country: "Equatorial Guinea",
        telLength: 7,
        iso2: "gq",
        JsxElement: (
            <img src="https://flagcdn.com/gq.svg" width="24" alt="Equatorial Guinea" />
        ),
    },
    {
        value: "+291",
        label: "+291",
        country: "Eritrea",
        telLength: 8,
        iso2: "er",
        JsxElement: (
            <img src="https://flagcdn.com/er.svg" width="24" alt="Eritrea" />
        ),
    },
    {
        value: "+372",
        label: "+372",
        country: "Estonia",
        telLength: 9,
        iso2: "ee",
        JsxElement: (
            <img src="https://flagcdn.com/ee.svg" width="24" alt="Estonia" />
        ),
    },
    {
        value: "+251",
        label: "+251",
        country: "Ethiopia",
        telLength: 10,
        iso2: "et",
        JsxElement: (
            <img src="https://flagcdn.com/et.svg" width="24" alt="Ethiopia" />
        ),
    },
    {
        value: "+500",
        label: "+500",
        country: "Falkland Islands (Malvinas)",
        telLength: 7,
        iso2: "fk",
        JsxElement: (
            <img src="https://flagcdn.com/fk.svg" width="24" alt="Falkland Islands (Malvinas)" />
        ),
    },
    {
        value: "+298",
        label: "+298",
        country: "Faroe Islands",
        telLength: 8,
        iso2: "fo",
        JsxElement: (
            <img src="https://flagcdn.com/fo.svg" width="24" alt="Faroe Islands" />
        ),
    },
    {
        value: "+679",
        label: "+679",
        country: "Fiji",
        telLength: 7,
        iso2: "fj",
        JsxElement: (
            <img src="https://flagcdn.com/fj.svg" width="24" alt="Fiji" />
        ),
    },
    {
        value: "+358",
        label: "+358",
        country: "Finland",
        telLength: 10,
        iso2: "fi",
        JsxElement: (
            <img src="https://flagcdn.com/fi.svg" width="24" alt="Finland" />
        ),
    },
    {
        value: "+33",
        label: "+33",
        country: "France",
        telLength: 11,
        iso2: "fr",
        JsxElement: (
            <img src="https://flagcdn.com/fr.svg" width="24" alt="France" />
        ),
    },
    {
        value: "+689",
        label: "+689",
        country: "French Polynesia",
        telLength: 8,
        iso2: "pf",
        JsxElement: (
            <img src="https://flagcdn.com/pf.svg" width="24" alt="French Polynesia" />
        ),
    },
    {
        value: "+241",
        label: "+241",
        country: "Gabon",
        telLength: 8,
        iso2: "ga",
        JsxElement: (
            <img src="https://flagcdn.com/ga.svg" width="24" alt="Gabon" />
        ),
    },
    {
        value: "+220",
        label: "+220",
        country: "Gambia",
        telLength: 8,
        iso2: "gm",
        JsxElement: (
            <img src="https://flagcdn.com/gm.svg" width="24" alt="Gambia" />
        ),
    },
    {
        value: "+995",
        label: "+995",
        country: "Georgia",
        telLength: 9,
        iso2: "ge",
        JsxElement: (
            <img src="https://flagcdn.com/ge.svg" width="24" alt="Georgia" />
        ),
    },
    {
        value: "+49",
        label: "+49",
        country: "Germany",
        telLength: 12,
        iso2: "de",
        JsxElement: (
            <img src="https://flagcdn.com/de.svg" width="24" alt="Germany" />
        ),
    },
    {
        value: "+233",
        label: "+233",
        country: "Ghana",
        telLength: 10,
        iso2: "gh",
        JsxElement: (
            <img src="https://flagcdn.com/gh.svg" width="24" alt="Ghana" />
        ),
    },
    {
        value: "+350",
        label: "+350",
        country: "Gibraltar",
        telLength: 8,
        iso2: "gi",
        JsxElement: (
            <img src="https://flagcdn.com/gi.svg" width="24" alt="Gibraltar" />
        ),
    },
    {
        value: "+30",
        label: "+30",
        country: "Greece",
        telLength: 10,
        iso2: "gr",
        JsxElement: (
            <img src="https://flagcdn.com/gr.svg" width="24" alt="Greece" />
        ),
    },
    {
        value: "+299",
        label: "+299",
        country: "Greenland",
        telLength: 6,
        iso2: "gl",
        JsxElement: (
            <img src="https://flagcdn.com/gl.svg" width="24" alt="Greenland" />
        ),
    },
    {
        value: "+1473",
        label: "+1473",
        country: "Grenada",
        telLength: 7,
        iso2: "gd",
        JsxElement: (
            <img src="https://flagcdn.com/gd.svg" width="24" alt="Grenada" />
        ),
    },
    {
        value: "+1671",
        label: "+1671",
        country: "Guam",
        telLength: 7,
        iso2: "gu",
        JsxElement: (
            <img src="https://flagcdn.com/gu.svg" width="24" alt="Guam" />
        ),
    },
    {
        value: "+502",
        label: "+502",
        country: "Guatemala",
        telLength: 8,
        iso2: "gt",
        JsxElement: (
            <img src="https://flagcdn.com/gt.svg" width="24" alt="Guatemala" />
        ),
    },
    {
        value: "+224",
        label: "+224",
        country: "Guinea",
        telLength: 8,
        iso2: "gn",
        JsxElement: (
            <img src="https://flagcdn.com/gn.svg" width="24" alt="Guinea" />
        ),
    },
    {
        value: "+245",
        label: "+245",
        country: "Guinea-Bissau",
        telLength: 8,
        iso2: "gw",
        JsxElement: (
            <img src="https://flagcdn.com/gw.svg" width="24" alt="Guinea-Bissau" />
        ),
    },
    {
        value: "+592",
        label: "+592",
        country: "Guyana",
        telLength: 8,
        iso2: "gy",
        JsxElement: (
            <img src="https://flagcdn.com/gy.svg" width="24" alt="Guyana" />
        ),
    },
    {
        value: "+509",
        label: "+509",
        country: "Haiti",
        telLength: 8,
        iso2: "ht",
        JsxElement: (
            <img src="https://flagcdn.com/ht.svg" width="24" alt="Haiti" />
        ),
    },
    {
        value: "+39",
        label: "+39",
        country: "Italy",
        telLength: 9,
        iso2: "it",
        JsxElement: (
            <img src="https://flagcdn.com/it.svg" width="24" alt="Italy" />
        ),
    },
    {
        value: "+504",
        label: "+504",
        country: "Honduras",
        telLength: 8,
        iso2: "hn",
        JsxElement: (
            <img src="https://flagcdn.com/hn.svg" width="24" alt="Honduras" />
        ),
    },
    {
        value: "+852",
        label: "+852",
        country: "Hong Kong",
        telLength: 8,
        iso2: "hk",
        JsxElement: (
            <img src="https://flagcdn.com/hk.svg" width="24" alt="Hong Kong" />
        ),
    },
    {
        value: "+36",
        label: "+36",
        country: "Hungary",
        telLength: 9,
        iso2: "hu",
        JsxElement: (
            <img src="https://flagcdn.com/hu.svg" width="24" alt="Hungary" />
        ),
    },
    {
        value: "+354",
        label: "+354",
        country: "Iceland",
        telLength: 7,
        iso2: "is",
        JsxElement: (
            <img src="https://flagcdn.com/is.svg" width="24" alt="Iceland" />
        ),
    },
    {
        value: "+91",
        label: "+91",
        country: "India",
        telLength: 10,
        iso2: "in",
        JsxElement: (
            <img src="https://flagcdn.com/in.svg" width="24" alt="India" />
        ),
    },
    {
        value: "+62",
        label: "+62",
        country: "Indonesia",
        telLength: 11,
        iso2: "id",
        JsxElement: (
            <img src="https://flagcdn.com/id.svg" width="24" alt="Indonesia" />
        ),
    },
    {
        value: "+98",
        label: "+98",
        country: "Iran",
        telLength: 10,
        iso2: "ir",
        JsxElement: (
            <img src="https://flagcdn.com/ir.svg" width="24" alt="Iran" />
        ),
    },
    {
        value: "+964",
        label: "+964",
        country: "Iraq",
        telLength: 10,
        iso2: "iq",
        JsxElement: (
            <img src="https://flagcdn.com/iq.svg" width="24" alt="Iraq" />
        ),
    },
    {
        value: "+353",
        label: "+353",
        country: "Ireland",
        telLength: 9,
        iso2: "ie",
        JsxElement: (
            <img src="https://flagcdn.com/ie.svg" width="24" alt="Ireland" />
        ),
    },
    {
        value: "+972",
        label: "+972",
        country: "Israel",
        telLength: 10,
        iso2: "il",
        JsxElement: (
            <img src="https://flagcdn.com/il.svg" width="24" alt="Israel" />
        ),
    },
    {
        value: "+39",
        label: "+39",
        country: "Italy",
        telLength: 9,
        iso2: "it",
        JsxElement: (
            <img src="https://flagcdn.com/it.svg" width="24" alt="Italy" />
        ),
    },
    {
        value: "+225",
        label: "+225",
        country: "Ivory Coast",
        telLength: 9,
        iso2: "ci",
        JsxElement: (
            <img src="https://flagcdn.com/ci.svg" width="24" alt="Ivory Coast" />
        ),
    },
    {
        value: "+1876",
        label: "+1876",
        country: "Jamaica",
        telLength: 10,
        iso2: "jm",
        JsxElement: (
            <img src="https://flagcdn.com/jm.svg" width="24" alt="Jamaica" />
        ),
    },
    {
        value: "+81",
        label: "+81",
        country: "Japan",
        telLength: 10,
        iso2: "jp",
        JsxElement: (
            <img src="https://flagcdn.com/jp.svg" width="24" alt="Japan" />
        ),
    },
    {
        value: "+962",
        label: "+962",
        country: "Jordan",
        telLength: 9,
        iso2: "jo",
        JsxElement: (
            <img src="https://flagcdn.com/jo.svg" width="24" alt="Jordan" />
        ),
    },
    {
        value: "+7",
        label: "+7",
        country: "Kazakhstan",
        telLength: 10,
        iso2: "kz",
        JsxElement: (
            <img src="https://flagcdn.com/kz.svg" width="24" alt="Kazakhstan" />
        ),
    },
    {
        value: "+254",
        label: "+254",
        country: "Kenya",
        telLength: 10,
        iso2: "ke",
        JsxElement: (
            <img src="https://flagcdn.com/ke.svg" width="24" alt="Kenya" />
        ),
    },
    {
        value: "+686",
        label: "+686",
        country: "Kiribati",
        telLength: 8,
        iso2: "ki",
        JsxElement: (
            <img src="https://flagcdn.com/ki.svg" width="24" alt="Kiribati" />
        ),
    },
    {
        value: "+850",
        label: "+850",
        country: "North Korea",
        telLength: 10,
        iso2: "kp",
        JsxElement: (
            <img src="https://flagcdn.com/kp.svg" width="24" alt="North Korea" />
        ),
    },
    {
        value: "+82",
        label: "+82",
        country: "South Korea",
        telLength: 10,
        iso2: "kr",
        JsxElement: (
            <img src="https://flagcdn.com/kr.svg" width="24" alt="South Korea" />
        ),
    },
    {
        value: "+381",
        label: "+381",
        country: "Serbia",
        telLength: 8,
        iso2: "rs",
        JsxElement: (
            <img src="https://flagcdn.com/rs.svg" width="24" alt="Serbia" />
        ),
    },
    {
        value: "+965",
        label: "+965",
        country: "Kuwait",
        telLength: 8,
        iso2: "kw",
        JsxElement: (
            <img src="https://flagcdn.com/kw.svg" width="24" alt="Kuwait" />
        ),
    },
    {
        value: "+996",
        label: "+996",
        country: "Kyrgyzstan",
        telLength: 9,
        iso2: "kg",
        JsxElement: (
            <img src="https://flagcdn.com/kg.svg" width="24" alt="Kyrgyzstan" />
        ),
    },
    {
        value: "+856",
        label: "+856",
        country: "Lao People's Democratic Republic",
        telLength: 9,
        iso2: "la",
        JsxElement: (
            <img src="https://flagcdn.com/la.svg" width="24" alt="Lao People's Democratic Republic" />
        ),
    },
    {
        value: "+371",
        label: "+371",
        country: "Latvia",
        telLength: 8,
        iso2: "lv",
        JsxElement: (
            <img src="https://flagcdn.com/lv.svg" width="24" alt="Latvia" />
        ),
    },
    {
        value: "+961",
        label: "+961",
        country: "Lebanon",
        telLength: 8,
        iso2: "lb",
        JsxElement: (
            <img src="https://flagcdn.com/lb.svg" width="24" alt="Lebanon" />
        ),
    },
    {
        value: "+266",
        label: "+266",
        country: "Lesotho",
        telLength: 8,
        iso2: "ls",
        JsxElement: (
            <img src="https://flagcdn.com/ls.svg" width="24" alt="Lesotho" />
        ),
    },
    {
        value: "+231",
        label: "+231",
        country: "Liberia",
        telLength: 7,
        iso2: "lr",
        JsxElement: (
            <img src="https://flagcdn.com/lr.svg" width="24" alt="Liberia" />
        ),
    },
    {
        value: "+218",
        label: "+218",
        country: "Libyan Arab Jamahiriya",
        telLength: 9,
        iso2: "ly",
        JsxElement: (
            <img src="https://flagcdn.com/ly.svg" width="24" alt="Libyan Arab Jamahiriya" />
        ),
    },
    {
        value: "+423",
        label: "+423",
        country: "Liechtenstein",
        telLength: 8,
        iso2: "li",
        JsxElement: (
            <img src="https://flagcdn.com/li.svg" width="24" alt="Liechtenstein" />
        ),
    },
    {
        value: "+370",
        label: "+370",
        country: "Lithuania",
        telLength: 8,
        iso2: "lt",
        JsxElement: (
            <img src="https://flagcdn.com/lt.svg" width="24" alt="Lithuania" />
        ),
    },
    {
        value: "+352",
        label: "+352",
        country: "Luxembourg",
        telLength: 8,
        iso2: "lu",
        JsxElement: (
            <img src="https://flagcdn.com/lu.svg" width="24" alt="Luxembourg" />
        ),
    },
    {
        value: "+853",
        label: "+853",
        country: "Macao",
        telLength: 8,
        iso2: "mo",
        JsxElement: (
            <img src="https://flagcdn.com/mo.svg" width="24" alt="Macao" />
        ),
    },
    {
        value: "+389",
        label: "+389",
        country: "Macedonia",
        telLength: 8,
        iso2: "mk",
        JsxElement: (
            <img src="https://flagcdn.com/mk.svg" width="24" alt="Macedonia" />
        ),
    },
    {
        value: "+261",
        label: "+261",
        country: "Madagascar",
        telLength: 9,
        iso2: "mg",
        JsxElement: (
            <img src="https://flagcdn.com/mg.svg" width="24" alt="Madagascar" />
        ),
    },
    {
        value: "+265",
        label: "+265",
        country: "Malawi",
        telLength: 8,
        iso2: "mw",
        JsxElement: (
            <img src="https://flagcdn.com/mw.svg" width="24" alt="Malawi" />
        ),
    },
    {
        value: "+60",
        label: "+60",
        country: "Malaysia",
        telLength: 10,
        iso2: "my",
        JsxElement: (
            <img src="https://flagcdn.com/my.svg" width="24" alt="Malaysia" />
        ),
    },
    {
        value: "+960",
        label: "+960",
        country: "Maldives",
        telLength: 8,
        iso2: "mv",
        JsxElement: (
            <img src="https://flagcdn.com/mv.svg" width="24" alt="Maldives" />
        ),
    },
    {
        value: "+223",
        label: "+223",
        country: "Mali",
        telLength: 8,
        iso2: "ml",
        JsxElement: (
            <img src="https://flagcdn.com/ml.svg" width="24" alt="Mali" />
        ),
    },
    {
        value: "+356",
        label: "+356",
        country: "Malta",
        telLength: 8,
        iso2: "mt",
        JsxElement: (
            <img src="https://flagcdn.com/mt.svg" width="24" alt="Malta" />
        ),
    },
    {
        value: "+692",
        label: "+692",
        country: "Marshall Islands",
        telLength: 7,
        iso2: "mh",
        JsxElement: (
            <img src="https://flagcdn.com/mh.svg" width="24" alt="Marshall Islands" />
        ),
    },
    {
        value: "+222",
        label: "+222",
        country: "Mauritania",
        telLength: 8,
        iso2: "mr",
        JsxElement: (
            <img src="https://flagcdn.com/mr.svg" width="24" alt="Mauritania" />
        ),
    },
    {
        value: "+230",
        label: "+230",
        country: "Mauritius",
        telLength: 8,
        iso2: "mu",
        JsxElement: (
            <img src="https://flagcdn.com/mu.svg" width="24" alt="Mauritius" />
        ),
    },
    {
        value: "+262",
        label: "+262",
        country: "Mayotte",
        telLength: 8,
        iso2: "yt",
        JsxElement: (
            <img src="https://flagcdn.com/yt.svg" width="24" alt="Mayotte" />
        ),
    },
    {
        value: "+52",
        label: "+52",
        country: "Mexico",
        telLength: 10,
        iso2: "mx",
        JsxElement: (
            <img src="https://flagcdn.com/mx.svg" width="24" alt="Mexico" />
        ),
    },
    {
        value: "+691",
        label: "+691",
        country: "Micronesia, Federated States Of",
        telLength: 7,
        iso2: "fm",
        JsxElement: (
            <img src="https://flagcdn.com/fm.svg" width="24" alt="Micronesia, Federated States Of" />
        ),
    },
    {
        value: "+373",
        label: "+373",
        country: "Moldova",
        telLength: 8,
        iso2: "md",
        JsxElement: (
            <img src="https://flagcdn.com/md.svg" width="24" alt="Moldova" />
        ),
    },
    {
        value: "+377",
        label: "+377",
        country: "Monaco",
        telLength: 8,
        iso2: "mc",
        JsxElement: (
            <img src="https://flagcdn.com/mc.svg" width="24" alt="Monaco" />
        ),
    },
    {
        value: "+976",
        label: "+976",
        country: "Mongolia",
        telLength: 8,
        iso2: "mn",
        JsxElement: (
            <img src="https://flagcdn.com/mn.svg" width="24" alt="Mongolia" />
        ),
    },
    {
        value: "+382",
        label: "+382",
        country: "Montenegro",
        telLength: 8,
        iso2: "me",
        JsxElement: (
            <img src="https://flagcdn.com/me.svg" width="24" alt="Montenegro" />
        ),
    },
    {
        value: "+1664",
        label: "+1664",
        country: "Montserrat",
        telLength: 7,
        iso2: "ms",
        JsxElement: (
            <img src="https://flagcdn.com/ms.svg" width="24" alt="Montserrat" />
        ),
    },
    {
        value: "+212",
        label: "+212",
        country: "Morocco",
        telLength: 10,
        iso2: "ma",
        JsxElement: (
            <img src="https://flagcdn.com/ma.svg" width="24" alt="Morocco" />
        ),
    },
    {
        value: "+258",
        label: "+258",
        country: "Mozambique",
        telLength: 9,
        iso2: "mz",
        JsxElement: (
            <img src="https://flagcdn.com/mz.svg" width="24" alt="Mozambique" />
        ),
    },
    {
        value: "+95",
        label: "+95",
        country: "Myanmar",
        telLength: 8,
        iso2: "mm",
        JsxElement: (
            <img src="https://flagcdn.com/mm.svg" width="24" alt="Myanmar" />
        ),
    },
    {
        value: "+264",
        label: "+264",
        country: "Namibia",
        telLength: 8,
        iso2: "na",
        JsxElement: (
            <img src="https://flagcdn.com/na.svg" width="24" alt="Namibia" />
        ),
    },
    {
        value: "+674",
        label: "+674",
        country: "Nauru",
        telLength: 8,
        iso2: "nr",
        JsxElement: (
            <img src="https://flagcdn.com/nr.svg" width="24" alt="Nauru" />
        ),
    },
    {
        value: "+977",
        label: "+977",
        country: "Nepal",
        telLength: 10,
        iso2: "np",
        JsxElement: (
            <img src="https://flagcdn.com/np.svg" width="24" alt="Nepal" />
        ),
    },
    {
        value: "+31",
        label: "+31",
        country: "Netherlands",
        telLength: 10,
        iso2: "nl",
        JsxElement: (
            <img src="https://flagcdn.com/nl.svg" width="24" alt="Netherlands" />
        ),
    },
    {
        value: "+599",
        label: "+599",
        country: "Netherlands Antilles",
        telLength: 10,
        iso2: "nl",
        JsxElement: (
            <img src="https://flagcdn.com/nl.svg" width="24" alt="Netherlands Antilles" />
        ),
    },
    {
        value: "+687",
        label: "+687",
        country: "New Caledonia",
        telLength: 8,
        iso2: "nc",
        JsxElement: (
            <img src="https://flagcdn.com/nc.svg" width="24" alt="New Caledonia" />
        ),
    },
    {
        value: "+64",
        label: "+64",
        country: "New Zealand",
        telLength: 10,
        iso2: "nz",
        JsxElement: (
            <img src="https://flagcdn.com/nz.svg" width="24" alt="New Zealand" />
        ),
    },
    {
        value: "+505",
        label: "+505",
        country: "Nicaragua",
        telLength: 8,
        iso2: "ni",
        JsxElement: (
            <img src="https://flagcdn.com/ni.svg" width="24" alt="Nicaragua" />
        ),
    },
    {
        value: "+227",
        label: "+227",
        country: "Niger",
        telLength: 8,
        iso2: "ne",
        JsxElement: (
            <img src="https://flagcdn.com/ne.svg" width="24" alt="Niger" />
        ),
    },
    {
        value: "+234",
        label: "+234",
        country: "Nigeria",
        telLength: 10,
        iso2: "ng",
        JsxElement: (
            <img src="https://flagcdn.com/ng.svg" width="24" alt="Nigeria" />
        ),
    },
    {
        value: "+683",
        label: "+683",
        country: "Niue",
        telLength: 8,
        iso2: "nu",
        JsxElement: (
            <img src="https://flagcdn.com/nu.svg" width="24" alt="Niue" />
        ),
    },
    {
        value: "+1670",
        label: "+1670",
        country: "Northern Mariana Islands",
        telLength: 7,
        iso2: "mp",
        JsxElement: (
            <img src="https://flagcdn.com/mp.svg" width="24" alt="Northern Mariana Islands" />
        ),
    },
    {
        value: "+47",
        label: "+47",
        country: "Norway",
        telLength: 8,
        iso2: "no",
        JsxElement: (
            <img src="https://flagcdn.com/no.svg" width="24" alt="Norway" />
        ),
    },
    {
        value: "+968",
        label: "+968",
        country: "Oman",
        telLength: 8,
        iso2: "om",
        JsxElement: (
            <img src="https://flagcdn.com/om.svg" width="24" alt="Oman" />
        ),
    },
    {
        value: "+92",
        label: "+92",
        country: "Pakistan",
        telLength: 10,
        iso2: "pk",
        JsxElement: (
            <img src="https://flagcdn.com/pk.svg" width="24" alt="Pakistan" />
        ),
    },
    {
        value: "+680",
        label: "+680",
        country: "Palau",
        telLength: 7,
        iso2: "pw",
        JsxElement: (
            <img src="https://flagcdn.com/pw.svg" width="24" alt="Palau" />
        ),
    },
    {
        value: "+970",
        label: "+970",
        country: "Palestinian Territory",
        telLength: 8,
        iso2: "ps",
        JsxElement: (
            <img src="https://flagcdn.com/ps.svg" width="24" alt="Palestinian Territory" />
        ),
    },
    {
        value: "+507",
        label: "+507",
        country: "Panama",
        telLength: 8,
        iso2: "pa",
        JsxElement: (
            <img src="https://flagcdn.com/pa.svg" width="24" alt="Panama" />
        ),
    },
    {
        value: "+675",
        label: "+675",
        country: "Papua New Guinea",
        telLength: 8,
        iso2: "pg",
        JsxElement: (
            <img src="https://flagcdn.com/pg.svg" width="24" alt="Papua New Guinea" />
        ),
    },
    {
        value: "+595",
        label: "+595",
        country: "Paraguay",
        telLength: 8,
        iso2: "py",
        JsxElement: (
            <img src="https://flagcdn.com/py.svg" width="24" alt="Paraguay" />
        ),
    },
    {
        value: "+51",
        label: "+51",
        country: "Peru",
        telLength: 9,
        iso2: "pe",
        JsxElement: (
            <img src="https://flagcdn.com/pe.svg" width="24" alt="Peru" />
        ),
    },
    {
        value: "+63",
        label: "+63",
        country: "Philippines",
        telLength: 10,
        iso2: "ph",
        JsxElement: (
            <img src="https://flagcdn.com/ph.svg" width="24" alt="Philippines" />
        ),
    },
    {
        value: "+48",
        label: "+48",
        country: "Poland",
        telLength: 9,
        iso2: "pl",
        JsxElement: (
            <img src="https://flagcdn.com/pl.svg" width="24" alt="Poland" />
        ),
    },
    {
        value: "+351",
        label: "+351",
        country: "Portugal",
        telLength: 9,
        iso2: "pt",
        JsxElement: (
            <img src="https://flagcdn.com/pt.svg" width="24" alt="Portugal" />
        ),
    },

    {
        value: "+974",
        label: "+974",
        country: "Qatar",
        telLength: 8,
        iso2: "qa",
        JsxElement: (
            <img src="https://flagcdn.com/qa.svg" width="24" alt="Qatar" />
        ),
    },
    {
        value: "+262",
        label: "+262",
        country: "Mayotte",
        telLength: 8,
        iso2: "yt",
        JsxElement: (
            <img src="https://flagcdn.com/yt.svg" width="24" alt="Mayotte" />
        ),
    },
    {
        value: "+40",
        label: "+40",
        country: "Romania",
        telLength: 9,
        iso2: "ro",
        JsxElement: (
            <img src="https://flagcdn.com/ro.svg" width="24" alt="Romania" />
        ),
    },
    {
        value: "+250",
        label: "+250",
        country: "Rwanda",
        telLength: 9,
        iso2: "rw",
        JsxElement: (
            <img src="https://flagcdn.com/rw.svg" width="24" alt="Rwanda" />
        ),
    },
    {
        value: "+290",
        label: "+290",
        country: "Saint Helena",
        telLength: 8,
        iso2: "sh",
        JsxElement: (
            <img src="https://flagcdn.com/sh.svg" width="24" alt="Saint Helena" />
        ),
    },
    {
        value: "+1869",
        label: "+1869",
        country: "Saint Kitts And Nevis",
        telLength: 7,
        iso2: "kn",
        JsxElement: (
            <img src="https://flagcdn.com/kn.svg" width="24" alt="Saint Kitts And Nevis" />
        ),
    },
    {
        value: "+1758",
        label: "+1758",
        country: "Saint Lucia",
        telLength: 7,
        iso2: "lc",
        JsxElement: (
            <img src="https://flagcdn.com/lc.svg" width="24" alt="Saint Lucia" />
        ),
    },
    {
        value: "+508",
        label: "+508",
        country: "Saint Pierre And Miquelon",
        telLength: 8,
        iso2: "pm",
        JsxElement: (
            <img src="https://flagcdn.com/pm.svg" width="24" alt="Saint Pierre And Miquelon" />
        ),
    },
    {
        value: "+1784",
        label: "+1784",
        country: "Saint Vincent And The Grenadines",
        telLength: 7,
        iso2: "vc",
        JsxElement: (
            <img src="https://flagcdn.com/vc.svg" width="24" alt="Saint Vincent And The Grenadines" />
        ),
    },
    {
        value: "+685",
        label: "+685",
        country: "Samoa",
        telLength: 7,
        iso2: "ws",
        JsxElement: (
            <img src="https://flagcdn.com/ws.svg" width="24" alt="Samoa" />
        ),
    },
    {
        value: "+378",
        label: "+378",
        country: "San Marino",
        telLength: 8,
        iso2: "sm",
        JsxElement: (
            <img src="https://flagcdn.com/sm.svg" width="24" alt="San Marino" />
        ),
    },
    {
        value: "+239",
        label: "+239",
        country: "Sao Tome And Principe",
        telLength: 8,
        iso2: "st",
        JsxElement: (
            <img src="https://flagcdn.com/st.svg" width="24" alt="Sao Tome And Principe" />
        ),
    },
    {
        value: "+966",
        label: "+966",
        country: "Saudi Arabia",
        telLength: 9,
        iso2: "sa",
        JsxElement: (
            <img src="https://flagcdn.com/sa.svg" width="24" alt="Saudi Arabia" />
        ),
    },
    {
        value: "+221",
        label: "+221",
        country: "Senegal",
        telLength: 9,
        iso2: "sn",
        JsxElement: (
            <img src="https://flagcdn.com/sn.svg" width="24" alt="Senegal" />
        ),
    },
    {
        value: "+381",
        label: "+381",
        country: "Serbia",
        telLength: 8,
        iso2: "rs",
        JsxElement: (
            <img src="https://flagcdn.com/rs.svg" width="24" alt="Serbia" />
        ),
    },
    {
        value: "+248",
        label: "+248",
        country: "Seychelles",
        telLength: 8,
        iso2: "sc",
        JsxElement: (
            <img src="https://flagcdn.com/sc.svg" width="24" alt="Seychelles" />
        ),
    },
    {
        value: "+232",
        label: "+232",
        country: "Sierra Leone",
        telLength: 8,
        iso2: "sl",
        JsxElement: (
            <img src="https://flagcdn.com/sl.svg" width="24" alt="Sierra Leone" />
        ),
    },
    {
        value: "+65",
        label: "+65",
        country: "Singapore",
        telLength: 8,
        iso2: "sg",
        JsxElement: (
            <img src="https://flagcdn.com/sg.svg" width="24" alt="Singapore" />
        ),
    },
    {
        value: "+421",
        label: "+421",
        country: "Slovakia",
        telLength: 9,
        iso2: "sk",
        JsxElement: (
            <img src="https://flagcdn.com/sk.svg" width="24" alt="Slovakia" />
        ),
    },
    {
        value: "+386",
        label: "+386",
        country: "Slovenia",
        telLength: 8,
        iso2: "si",
        JsxElement: (
            <img src="https://flagcdn.com/si.svg" width="24" alt="Slovenia" />
        ),
    },
    {
        value: "+677",
        label: "+677",
        country: "Solomon Islands",
        telLength: 8,
        iso2: "sb",
        JsxElement: (
            <img src="https://flagcdn.com/sb.svg" width="24" alt="Solomon Islands" />
        ),
    },
    {
        value: "+252",
        label: "+252",
        country: "Somalia",
        telLength: 8,
        iso2: "so",
        JsxElement: (
            <img src="https://flagcdn.com/so.svg" width="24" alt="Somalia" />
        ),
    },
    {
        value: "+27",
        label: "+27",
        country: "South Africa",
        telLength: 9,
        iso2: "za",
        JsxElement: (
            <img src="https://flagcdn.com/za.svg" width="24" alt="South Africa" />
        ),
    },
    {
        value: "+34",
        label: "+34",
        country: "Spain",
        telLength: 9,
        iso2: "es",
        JsxElement: (
            <img src="https://flagcdn.com/es.svg" width="24" alt="Spain" />
        ),
    },
    {
        value: "+94",
        label: "+94",
        country: "Sri Lanka",
        telLength: 9,
        iso2: "lk",
        JsxElement: (
            <img src="https://flagcdn.com/lk.svg" width="24" alt="Sri Lanka" />
        ),
    },
    {
        value: "+249",
        label: "+249",
        country: "Sudan",
        telLength: 10,
        iso2: "sd",
        JsxElement: (
            <img src="https://flagcdn.com/sd.svg" width="24" alt="Sudan" />
        ),
    },
    {
        value: "+597",
        label: "+597",
        country: "Suriname",
        telLength: 9,
        iso2: "sr",
        JsxElement: (
            <img src="https://flagcdn.com/sr.svg" width="24" alt="Suriname" />
        ),
    },
    {
        value: "+268",
        label: "+268",
        country: "Swaziland",
        telLength: 8,
        iso2: "sz",
        JsxElement: (
            <img src="https://flagcdn.com/sz.svg" width="24" alt="Swaziland" />
        ),
    },
    {
        value: "+46",
        label: "+46",
        country: "Sweden",
        telLength: 9,
        iso2: "se",
        JsxElement: (
            <img src="https://flagcdn.com/se.svg" width="24" alt="Sweden" />
        ),
    },
    {
        value: "+41",
        label: "+41",
        country: "Switzerland",
        telLength: 9,
        iso2: "ch",
        JsxElement: (
            <img src="https://flagcdn.com/ch.svg" width="24" alt="Switzerland" />
        ),
    },
    {
        value: "+963",
        label: "+963",
        country: "Syrian Arab Republic",
        telLength: 9,
        iso2: "sy",
        JsxElement: (
            <img src="https://flagcdn.com/sy.svg" width="24" alt="Syrian Arab Republic" />
        ),
    },
    {
        value: "+886",
        label: "+886",
        country: "Taiwan",
        telLength: 9,
        iso2: "tw",
        JsxElement: (
            <img src="https://flagcdn.com/tw.svg" width="24" alt="Taiwan" />
        ),
    },
    {
        value: "+992",
        label: "+992",
        country: "Tajikistan",
        telLength: 9,
        iso2: "tj",
        JsxElement: (
            <img src="https://flagcdn.com/tj.svg" width="24" alt="Tajikistan" />
        ),
    },
    {
        value: "+255",
        label: "+255",
        country: "Tanzania",
        telLength: 9,
        iso2: "tz",
        JsxElement: (
            <img src="https://flagcdn.com/tz.svg" width="24" alt="Tanzania" />
        ),
    },
    {
        value: "+66",
        label: "+66",
        country: "Thailand",
        telLength: 9,
        iso2: "th",
        JsxElement: (
            <img src="https://flagcdn.com/th.svg" width="24" alt="Thailand" />
        ),
    },
    {
        value: "+670",
        label: "+670",
        country: "Timor-Leste",
        telLength: 8,
        iso2: "tl",
        JsxElement: (
            <img src="https://flagcdn.com/tl.svg" width="24" alt="Timor-Leste" />
        ),
    },
    {
        value: "+228",
        label: "+228",
        country: "Togo",
        telLength: 8,
        iso2: "tg",
        JsxElement: (
            <img src="https://flagcdn.com/tg.svg" width="24" alt="Togo" />
        ),
    },
    {
        value: "+690",
        label: "+690",
        country: "Tokelau",
        telLength: 7,
        iso2: "tk",
        JsxElement: (
            <img src="https://flagcdn.com/tk.svg" width="24" alt="Tokelau" />
        ),
    },
    {
        value: "+676",
        label: "+676",
        country: "Tonga",
        telLength: 8,
        iso2: "to",
        JsxElement: (
            <img src="https://flagcdn.com/to.svg" width="24" alt="Tonga" />
        ),
    },
    {
        value: "+1868",
        label: "+1868",
        country: "Trinidad And Tobago",
        telLength: 7,
        iso2: "tt",
        JsxElement: (
            <img src="https://flagcdn.com/tt.svg" width="24" alt="Trinidad And Tobago" />
        ),
    },
    {
        value: "+216",
        label: "+216",
        country: "Tunisia",
        telLength: 9,
        iso2: "tn",
        JsxElement: (
            <img src="https://flagcdn.com/tn.svg" width="24" alt="Tunisia" />
        ),
    },
    {
        value: "+90",
        label: "+90",
        country: "Turkey",
        telLength: 9,
        iso2: "tr",
        JsxElement: (
            <img src="https://flagcdn.com/tr.svg" width="24" alt="Turkey" />
        ),
    },
    {
        value: "+993",
        label: "+993",
        country: "Turkmenistan",
        telLength: 8,
        iso2: "tm",
        JsxElement: (
            <img src="https://flagcdn.com/tm.svg" width="24" alt="Turkmenistan" />
        ),
    },
    {
        value: "+1649",
        label: "+1649",
        country: "Turks And Caicos Islands",
        telLength: 7,
        iso2: "tc",
        JsxElement: (
            <img src="https://flagcdn.com/tc.svg" width="24" alt="Turks And Caicos Islands" />
        ),
    },
    {
        value: "+688",
        label: "+688",
        country: "Tuvalu",
        telLength: 8,
        iso2: "tv",
        JsxElement: (
            <img src="https://flagcdn.com/tv.svg" width="24" alt="Tuvalu" />
        ),
    },
    {
        value: "1",
        label: "+1",
        country: "United States of America",
        telLength: 10,
        iso2: "us",
        JsxElement: (
            <img src="https://flagcdn.com/us.svg" width="24" alt="United States of America" />
        ),
    },
    {
        value: "+256",
        label: "+256",
        country: "Uganda",
        telLength: 9,
        iso2: "ug",
        JsxElement: (
            <img src="https://flagcdn.com/ug.svg" width="24" alt="Uganda" />
        ),
    },
    {
        value: "+380",
        label: "+380",
        country: "Ukraine",
        telLength: 10,
        iso2: "ua",
        JsxElement: (
            <img src="https://flagcdn.com/ua.svg" width="24" alt="Ukraine" />
        ),
    },
    {
        value: "+971",
        label: "+971",
        country: "United Arab Emirates",
        telLength: 9,
        iso2: "ae",
        JsxElement: (
            <img src="https://flagcdn.com/ae.svg" width="24" alt="United Arab Emirates" />
        ),
    },
    {
        value: "+44",
        label: "+44",
        country: "United Kingdom",
        telLength: 10,
        iso2: "gb",
        JsxElement: (
            <img src="https://flagcdn.com/gb.svg" width="24" alt="United Kingdom" />
        ),
    },

    {
        value: "+598",
        label: "+598",
        country: "Uruguay",
        telLength: 9,
        iso2: "uy",
        JsxElement: (
            <img src="https://flagcdn.com/uy.svg" width="24" alt="Uruguay" />
        ),
    },
    {
        value: "+998",
        label: "+998",
        country: "Uzbekistan",
        telLength: 9,
        iso2: "uz",
        JsxElement: (
            <img src="https://flagcdn.com/uz.svg" width="24" alt="Uzbekistan" />
        ),
    },
    {
        value: "+678",
        label: "+678",
        country: "Vanuatu",
        telLength: 7,
        iso2: "vu",
        JsxElement: (
            <img src="https://flagcdn.com/vu.svg" width="24" alt="Vanuatu" />
        ),
    },
    {
        value: "+58",
        label: "+58",
        country: "Venezuela",
        telLength: 11,
        iso2: "ve",
        JsxElement: (
            <img src="https://flagcdn.com/ve.svg" width="24" alt="Venezuela" />
        ),
    },
    {
        value: "+84",
        label: "+84",
        country: "Vietnam",
        telLength: 10,
        iso2: "vn",
        JsxElement: (
            <img src="https://flagcdn.com/vn.svg" width="24" alt="Vietnam" />
        ),
    },
    {
        value: "+1284",
        label: "+1284",
        country: "Virgin Islands, British",
        telLength: 10,
        iso2: "vg",
        JsxElement: (
            <img src="https://flagcdn.com/vg.svg" width="24" alt="Virgin Islands, British" />
        ),
    },
    {
        value: "+1340",
        label: "+1340",
        country: "Virgin Islands, U.s.",
        telLength: 10,
        iso2: "vi",
        JsxElement: (
            <img src="https://flagcdn.com/vi.svg" width="24" alt="Virgin Islands, U.s." />
        ),
    },
    {
        value: "+681",
        label: "+681",
        country: "Wallis And Futuna",
        telLength: 8,
        iso2: "wf",
        JsxElement: (
            <img src="https://flagcdn.com/wf.svg" width="24" alt="Wallis And Futuna" />
        ),
    },
    {
        value: "+967",
        label: "+967",
        country: "Yemen",
        telLength: 9,
        iso2: "ye",
        JsxElement: (
            <img src="https://flagcdn.com/ye.svg" width="24" alt="Yemen" />
        ),
    },
    {
        value: "+260",
        label: "+260",
        country: "Zambia",
        telLength: 9,
        iso2: "zm",
        JsxElement: (
            <img src="https://flagcdn.com/zm.svg" width="24" alt="Zambia" />
        ),
    },
    {
        value: "+263",
        label: "+263",
        country: "Zimbabwe",
        telLength: 9,
        iso2: "zw",
        JsxElement: (
            <img src="https://flagcdn.com/zw.svg" width="24" alt="Zimbabwe" />
        ),
    }
]
export default country;
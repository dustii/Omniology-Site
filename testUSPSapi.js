const axios = require('axios');

axios.get('https://secure.shippingapis.com/shippingapi.dll', {
    params: {
        API: 'RateV4',
        XML: `<RateV4Request USERID="058THEOM7585">
            <Revision>2</Revision>
            <Package ID="1ST">
            <Service>PRIORITY</Service>
            <ZipOrigination>33420</ZipOrigination>
            <ZipDestination>54174</ZipDestination>
            <Pounds>0</Pounds>
            <Ounces>2</Ounces>
            <Container></Container>
            <Width></Width>
            <Length></Length>
            <Height></Height>
            <Girth></Girth>
            <Machinable>false</Machinable>
            </Package>
            </RateV4Request>`
    }
})
.then(res => console.dir(res))
.catch(err => console.log(err));

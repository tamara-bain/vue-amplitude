# SETUP

1. Install with yarn  
`yarn add https://github.com/tamara-bain/vue-amplitude`

2. Add the following to your vue `main.js`

        import VueAmplitude from "@vue-amplitude"
    
    Then after your vue instance initialization:
        
        const amplitude_key = <YOUR AMPLITUDE API KEY>
        Vue.use(VueAmplitude, {amplitude_key, router: app.$router, debug: false, CLICK_DESCRIPTIONS: {}, CLICK_DESTINATIONS = {}, CLICK_SECTIONS = {} })


# USAGE

You can access a users amplitude specific device ID by doing the following inside a vue component:

`this.$amplitude.device_id`


#### Page Load Events

These are automatically sent when vue router resolves a route. The following data is sent:
- page
- path
- hash
- queryset


#### Click Events

You can send a click event with the following directive:

`v-amplitude-click`

The following data can be passed to v-amplitude click:

route (required - a vue router route object)
description (required - a string description)
destination (optional - where this button takes the user to)
section (optional - section this object appears on the page)

Example:

    <button v-amplitude-click="{route: this.$route, description: 'Login Button', destination: 'http://github.com', section: 'footer'}" />

The following data will also be set by default for every click event: 
- page
- path
- hash
- queryset



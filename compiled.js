

if(typeof pixeldepth == "undefined"){
    pixeldepth = {};
}

pixeldepth.monetary = monetary = (function(){
    /**
     * @class monetary
     * @static
     *
     * Main class that handles setup, init of sub modules, post event bindings and display of money across the forum.
     */

    var money = {

        /**
         * Holds the latest version of this plugin.
         * @property {String} VERSION
         */

        VERSION: "{VER}",

        /**
         * This is the ProBoards plugin key we are using.
         * @property {String} KEY
         */

        KEY: "pixeldepth_money",

        /**
         * This is the min required Yootil version that is needed.
         * @property {String} required_yootil_version
         */

        required_yootil_version: "1.0.0",

        /**
         * This holds a reference to the plugin object returned by ProBoards.
         * @property {Object} plugin
         */

        plugin: null,

        /**
         * Route gets cached here, as it gets wrote over by some AJAX responses.
         * We shouldn't need it, as Yootil does caching as well.
         *
         * @property {String} route
         */

        route: null,

        /**
         * Reference to ProBoards page params.
         * @property {Object} params
         */

        params: null,

        /**
         * Reference to the images object from ProBoards for this plugin.
         * @property {Object} images
         */

        images: null,

        /**
         * Used in the sync class to prevent IE from syncing the master (caller).
         * @property {Boolean} trigger_caller
         */

        trigger_caller: false,

        /**
         * Holds all default settings for this class, these can be overwritten in setup.
         * @property {Object} settings
         * @property {String} settings.money_text This is what the money is called.
         * @property {String} settings.money_symbol This holds the money symbol.
         * @property {String} settings.money_separator The separator between money_text and the money value.
         * @property {Boolean} settings.decimal_money Do we want to use decimals or not.
         * @property {Boolean} settings.show_in_mini_profile Should money show in the mini profiles.
         * @property {Boolean} settings.show_money_text_mini Should we show the money text in mini profiles.
         * @property {Boolean} settings.show_money_symbol_mini Should we show the money symbol in mini profiles.
         * @property {Boolean} settings.show_in_profile Should we show the money on profile pages.
         * @property {Boolean} settings.show_money_text_profile Should we show the money text on profiles.
         * @property {Boolean} settings.show_money_symbol_profile Should we show the money symbol on profiles.
         * @property {Boolean} settings.show_in_members_list Should we show the money on the members list page.
         * @property {Boolean} settings.show_money_symbol_members Should we show the money symbol on the members list page.
         * @property {Boolean} settings.member_list_text This is the text for the column on the members page.
         * @property {Boolean} settings.show_bank_balance_members Should we show the bank balance on the members page.
         * @property {Boolean} settings.staff_edit_money Can staff edit money on the profile page.
         * @property {Boolean} settings.show_edit_money_image Should we show the edit image on profile page.
         * @property {Array} settings.who_can_edit_money Holds an array of users who can edit money on the profile page.
         * @property {Object} settings.posting Holds settings to do with posting.
         * @property {Boolean} settings.posting.earn_from_quick_reply Can users earn money from the quick reply.
         * @property {Boolean} settings.posting.earn_from_quick_reply.amounts Holds the amounts users can earn from posting.
         * @property {Number} settings.posting.earn_from_quick_reply.amounts.per_thread Amount for a new thread.
         * @property {Number} settings.posting.earn_from_quick_reply.amounts.per_poll Amount for adding a poll to a thread.
         * @property {Number} settings.posting.earn_from_quick_reply.amounts.per_reply Amount for when replying to a thread.
         * @property {Number} settings.posting.earn_from_quick_reply.amounts.per_quick_reply Amount for replying while using the quick reply.
         * @property {Number} settings.posting.earn_from_quick_reply.amounts.per_mobile_post Amount for missing posts (on mobile).
         * @property {Object} settings.posting.earn_from_quick_reply.amounts.categories Can override amounts per category.
         * @property {Object} settings.posting.earn_from_quick_reply.amounts.boards Can override amounts per board.
         * @property {Object} settings.notification Settings for notifications that users get when their money is edited.
         * @property {Boolean} settings.notification.show Should the notification show for users.
         * @property {Boolean} settings.notification.show_edited If enabled, it will show the user who made the edit to their money.
         * @property {Array} settings.no_earn_members Members who are not allowed to earn money.
         * @property {Array} settings.no_earn_groups Groups who are not allowed to earn money.
         * @property {Array} settings.no_earn_categories Categories where money can not be earned.
         * @property {Array} settings.no_earn_boards Boards where money can not be earned.
         * @property {Array} settings.no_earn_threads Threads where money can not be earned.
         * @property {Object} settings.text Holds text values that can be changed in the plugin admin area.
         * @property {String} settings.text.wallet The wallet.
         * @property {String} settings.text.money_column This is for the members list page.
         * @property {String} settings.text.bank_column This is for the members list page.
         */

        settings: {

            check_for_update: true,
            check_how_often: 2,

            money_text: "Money",
            money_symbol: "&pound;",
            money_separator: ":",

            decimal_money: true,

            show_in_mini_profile: true,
            show_money_text_mini: true,
            show_money_symbol_mini: true,

            show_in_profile: true,
            show_money_text_profile: true,
            show_money_symbol_profile: true,

            show_in_members_list: true,
            show_money_symbol_members: true,
            member_list_text: "Money",
            show_bank_balance_members: false,

            staff_edit_money: true,
            show_edit_money_image: true,
            who_can_edit_money: [],

            posting: {

                earn_from_quick_reply: false,
                amounts: {

                    per_thread: 10,
                    per_poll: 5,
                    per_reply: 5,
                    per_quick_reply: 5,
                    per_mobile_post: 2,

                    categories: {},
                    boards: {}

                }
            },

            notification: {

                show: false,
                show_edited: true

            },

            no_earn_members: [],
            no_earn_groups: [],
            no_earn_categories: [],
            no_earn_boards: [],
            no_earn_threads: [],

            text: {

                wallet: "Wallet",
                money_column: "Money",
                bank_column: "Bank Balance"

            }

        },

        /**
         * Updated when posting to see if it's a new thread to work out money amount.
         * @property {Boolean} is_new_thread
         */

        is_new_thread: false,

        /**
         * Are we editing a post?  We don't want to update money if editing, so we check.
         * @property {Boolean} is_editing
         */

        is_editing: false,

        /**
         * If money has been processed, we update here so we don't process again (this is old).
         * @property {Boolean} processed
         */

        processed: false,

        /**
         * We update this if quick reply is being used, this was before key events were added.
         * @property {Boolean} using_quick_reply
         */

        using_quick_reply: false,

        /**
         * This can be used to prevent money being earnt on the page.
         * @property {Boolean} can_earn_money
         */

        can_earn_money: true,

        /**
         * Used to show the default display of the forum.
         * @property {Boolean} can_show_default
         */

        can_show_default: true,

        /**
         * Modules are registered and placed in here and init later.
         * @property {Array} modules
         */

        modules: [],

        /**
         * A lookup table for user data objects on the page, always check here first before making a new Data instance.
         * @property {Object} user_data_table
         */

        user_data_table: {},

        /**
         * Instance of our notification class
         * @property {Object} notify
         */

        notify: null,

        event: {},

        /**
         * Starts the magic.
         * Various this happening here.  We do Yootil checks, setup user lookup table, and other checks.
         */

        init: function(){
            $.support.cors = true;

            if(!this.check_yootil()){
                return;
            }

            this.setup_user_data_table();
            this.setup();

            if(yootil.user.logged_in()){
                this.check_for_notifications();
                this.look_for_wallet();
                this.can_earn_money = this.can_earn();

                if(yootil.location.posting() || (yootil.location.thread() && this.settings.posting.earn_from_quick_reply)){
                    if(this.can_earn_money && this.can_earn_in_cat_board()){
                        this.bind_events();
                    }
                }
            }

            if(this.modules.length){
                for(var m = 0, ml = this.modules.length; m < ml; m ++){
                    if(this.modules[m].init){
                        this.modules[m].init();
                    }
                }
            }

            var location_check = (yootil.location.search_results() || yootil.location.message_thread() || yootil.location.thread() || yootil.location.recent_posts());

            if(this.settings.show_in_mini_profile && location_check){
                this.show_in_mini_profile();
                yootil.ajax.after_search(this.show_in_mini_profile, this);
            }

            if(this.settings.show_in_profile && yootil.location.profile_home() && this.params && this.params.user_id != "undefined"){
                this.show_in_profile();
            }

            if(this.settings.show_in_members_list && yootil.location.members()){
                this.show_in_members_list();
                yootil.ajax.after_search(this.show_in_members_list, this);
            }
        },

        /**
         * Uses yootils notification class.
         *
         *     monetary.create_notification("message", 1);
         *
         * @param {String} msg The message for the notification.
         * @param {Number} user_id The user id who is receiving this notification.
         */

        create_notification: function(msg, user_id){
            if(!msg || !user_id){
                return;
            }

            if(typeof this.notify != "undefined"){
                this.notify.create(msg, user_id);
            }
        },

        /**
         * Used to correct incorrect dates that were being saved.
         * @deprecated
         * @param {Number} the_date The date to be corrected.
         * @return {Object} Date object.
         */

        correct_date: function(the_date){
            if(the_date.toString().indexOf(".") != -1){
                return new Date(the_date * 1000);
            }

            return new Date(the_date);
        },

        /**
         * This sets up the lookup table for all users on the current page.  Each entry is an instance of Data.  Always
         * look here before creating your own instance, as multiple instances would not be good.
         *
         *  It is recommended that if you do create an instance of Data to update the lookup table (key being user id).
         */

        setup_user_data_table: function(){
            var all_data = proboards.plugin.keys.data[this.KEY];

            for(var key in all_data){
                var data = this.check_data(all_data[key]);

                this.user_data_table[key] = new this.Data(key, data);
            }
        },

        /**
         * Refreshed the user data lookup table.
         */

        refresh_user_data_table: function(){
            this.setup_user_data_table();
        },

        /**
         * @property {Array} months An array of months used throughout the plugin and it's modules.
         */

        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],

        /**
         * @property {Array} days An array of days used throughout the plugin and it's modules.
         */

        days: ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"],

        /**
         * Checks a number and returns the correct suffix to be used with it.
         *
         *     monetary.get_suffix(3); // "rd"
         *
         * @param {Number} n The number to be checked.
         * @return {String}
         */

        get_suffix: function(n){
            var j = (n % 10);

            if(j == 1 && n != 11){
                return "st";
            }

            if(j == 2 && n != 12){
                return "nd";
            }

            if(j == 3 && n != 13) {
                return "rd";
            }

            return "th";
        },

        /**
         * Gets current version of the plugin.
         *
         * @return {String}
         */

        version: function(){
            return this.VERSION;
        },

        /**
         * Checks the data type to make sure it's correct.  The reason for this is because ProBoards
         * never used to JSON stringify values, so we check to make sure it's not double stringified.
         *
         * @param {String} data The key data.
         * @return {Object}
         */

        check_data: function(data){
            if(typeof data == "string" && yootil.is_json(data)){
                data = JSON.parse(data);
            }

            return data;
        },

        /**
         * Looks for any element with the wallet class and updates the html of it.
         */

        look_for_wallet: function(){
            var wallet = $(".money_wallet_amount");

            if(wallet.length){
                wallet.html(this.settings.text.wallet + this.settings.money_separator + this.settings.money_symbol + yootil.html_encode(this.data(yootil.user.id()).get.money(true)));
            }
        },

        /**
         * Yootil is needed, so we check for it, and also check that we are using the needed version.
         *
         * @return {Boolean}
         */

        check_yootil: function(){
            if(proboards.data && proboards.data("user") && proboards.data("user").id == 1){
                var body = "";
                var title = "";

                if(typeof yootil == "undefined"){
                    title = "<div class=\"title-bar\"><h2>Monetary System - Yootil Not Found</h2></div>";
                    body = "<p>You do not have the <a href='http://support.proboards.com/thread/429360/'>Yootil</a> plugin installed.</p>";
                    body += "<p>Without the <a href='http://support.proboards.com/thread/429360/'>Yootil</a> plugin, the <a href='http://support.proboards.com/thread/429762/'>Monetary System</a> will not work.</p>";
                } else {
                    var versions = yootil.convert_versions(yootil.version(), this.required_yootil_version);

                    if(versions[0] < versions[1]){
                        title = "<div class=\"title-bar\"><h2>Monetary System - Yootil Needs Updating</h2></div>";
                        body += "<p>The <a href='http://support.proboards.com/thread/429762/'>Monetary System</a> requires at least " + yootil.html_encode(this.required_yootil_version) + " of the <a href='http://support.proboards.com/thread/429360/'>Yootil</a> plugin.</p>";
                    }
                }

                if(title.length){
                    var msg = "<div class='monetary-notification-content'>";

                    msg += body;

                    msg += "<p style='margin-top: 8px;'>For more information, please visit the <a href='http://support.proboards.com/thread/429762/#plugindownload'>Monetary System</a> forum topic on the <a href='http://support.proboards.com'>ProBoards forum</a>.</p>";

                    msg += "</div>";

                    var notification = "<div class=\"container monetary-yootil-notification\">";

                    notification += title;
                    notification += "<div class=\"content pad-all\">" + msg + "</div></div>";

                    $("div#content").prepend(notification);

                    return false;
                }
            }

            return true;
        },

        /**
         * Shows the forum default display by showing the content div and all children.  This is generally used
         * in the modules where the setting for the module is disabled.
         */

        show_default: function(){
            if(this.can_show_default){
                $("#content > *").show();
            }
        },

        /**
         * Formats the money value into a whole or float number depending on settings.
         *
         *     monetary.format(33, true); // "33.00"
         *
         * @param {String} str Money value to be formatted.
         * @param {Boolean} string If a string is needed back, pass in true.
         * @return {Mixed}
         */

        format: function(str, string){
            var str = parseFloat(str);

            if(money.settings.decimal_money){
                str = str.toFixed(2);

                if(isNaN(str)){
                    if(string){
                        str = "0.00";
                    } else {
                        str = 0.00;
                    }
                }
            } else {
                str = parseInt(Math.ceil(str));

                if(isNaN(str)){
                    if(string){
                        str = "0";
                    } else {
                        str = 0;
                    }
                }
            }

            if(string){
                str = str.toString();
            }

            return str;
        },

        /**
         * 	This is deprecated, please see the data method and Data class.
         *
         * @deprecated
         */

        get: function(format, bank){
            return this.data(yootil.user.id()).get[((bank)? "bank" : "money")](format);
        },

        /**
         * This is deprecated, please see the data method and Data class.
         *
         * @deprecated
         */

        subtract: function(value, bank, no_update, opts, sync){
            this.data(yootil.user.id()).decrease[((bank)? "bank" : "money")](value, no_update, opts, sync);
        },

        /**
         * This is deprecated, please see the data method and Data class.
         *
         * @deprecated
         */

        add: function(value, bank, no_update, opts, sync){
            this.data(yootil.user.id()).increase[((bank)? "bank" : "money")](value, no_update, opts, sync);
        },

        /**
         * Ddisables earning when posting.
         */

        disable_earning: function(){
            this.can_earn_money = false;
        },

        /**
         * Enable earning when posting (earning is enabled by default).
         */

        enable_earning: function(){
            this.can_earn_money = true;
        },

        /**
         * This is used to get the instance of the users Data class from the lookup table.  Please see the Data
         * class to see methods available.
         *
         *     monetary.data(yootil.user.id()).get.money(); // Returns users money
         *
         *     monetary.data(yootil.user.id()).increase.money(100); // Adds 100 to users money
         *
         * @param {Number} user_id The user id of the users data you want.
         * @return {Object}
         */

        data: function(user_id){
            var user_data = this.user_data_table[((user_id)? user_id : yootil.user.id())];

            if(!user_data){
                user_data = new this.Data(user_id);
                this.user_data_table[user_id] = user_data;
            }

            return user_data;
        },

        /**
         * Checks to see if the user can earn money.
         *
         * @return {Boolean}
         */

        can_earn: function(){
            if(this.settings.no_earn_members && this.settings.no_earn_members.length){
                if($.inArrayLoose(yootil.user.id(), this.settings.no_earn_members) > -1){
                    return false;
                }
            }

            if(this.settings.no_earn_groups && this.settings.no_earn_groups.length){
                var user_groups = yootil.user.group_ids();

                for(var g = 0, l = user_groups.length; g < l; g ++){
                    if($.inArrayLoose(user_groups[g], this.settings.no_earn_groups) > -1){
                        return false;
                    }
                }
            }

            return true;
        },

        /**
         * Cleans the money value to make sure it is safe and valid.
         *
         * @return {String}
         */

        clean_money: function(money){
            return money.toString().replace(/[^\d\.]/g, "");
        },

        /**
         * Checks to see if money can be earned in categories and boards
         *
         * @return {Boolean}
         */

        can_earn_in_cat_board: function(){
            if(this.settings.no_earn_categories && this.settings.no_earn_categories.length){
                var cat_id = parseInt(yootil.page.category.id());

                if(cat_id){
                    if($.inArrayLoose(cat_id, this.settings.no_earn_categories) > -1){
                        return false;
                    }
                }
            }

            if(this.settings.no_earn_boards && this.settings.no_earn_boards.length){
                var board_id = parseInt(yootil.page.board.id());

                if(board_id && $.inArrayLoose(board_id, this.settings.no_earn_boards) > -1){
                    return false;
                }
            }

            return true;
        },

        /**
         * Clears the autosave for posts.  This was a bug reported, and this seems to fix it.
         */

        clear_auto_save: function(){
            proboards.autosave.clear();
        },

        /**
         * Handles binding events to earn money when posting.
         */

        bind_events: function(){

            // Check if in thread or posting, then check if thread is disabled
            // from earning

            if((yootil.location.thread() || yootil.location.posting()) && this.settings.no_earn_threads.length){
                var thread_id = parseInt(yootil.page.thread.id());

                if(thread_id){
                    for(var i = 0, l = this.settings.no_earn_threads.length; i < l; i ++){
                        if(this.settings.no_earn_threads[i].thread_id == thread_id){
                            return false;
                        }
                    }
                }
            }

            if(yootil.location.posting_thread()){
                this.is_new_thread = true;
            }

            if(yootil.location.editing()){
                this.is_editing = true;
            }

            var self = this;
            var the_form;
            var hook;

            if(yootil.location.posting()){
                the_form = yootil.form.post();
                hook = (this.is_new_thread)? "thread_new" : "post_new";
            } else if(yootil.location.thread()){
                the_form = yootil.form.post_quick_reply();
                this.using_quick_reply = true;
                hook = "post_quick_reply";
            }

            if(the_form.length){
                the_form.bind("submit", function(event){
                    if(!self.processed){
                        if(self.is_new_thread || self.is_editing){
                            var poll_input = $(this).find("input[name=has_poll]");

                            self.is_poll = (poll_input && poll_input.val() == 1)? true : false;
                        }

                        if(hook){
                            self.apply_posting_money(hook);
                            self.clear_auto_save();
                        }
                    }
                });
            }
        },

        /**
         * Handles applying money for posting, wages, rank up etc.  Also overrides posting amounts if there are
         * category or board settings.
         *
         * @param {String} event The key event we are hooking.
         */

        apply_posting_money: function(event){
            if(!this.can_earn_money){
                return false;
            }

            /**
             * Triggers before applying money to account when they are posting.
             *
             *     $(monetary.event).on("before_apply_posting_money", function(event){
             *         console.log("do something");
             *     });
             *
             * @event before_apply_posting_money
             */

            $(monetary.event).trigger("before_apply_posting_money");

            var money_to_add = 0.00;
            var category_id = yootil.page.category.id();
            var board_id = yootil.page.board.id();

            if(board_id && this.settings.posting.amounts.boards[board_id]){
                var amounts = this.settings.posting.amounts.boards[board_id];

                this.settings.posting.amounts.per_quick_reply = amounts.per_quick_reply;
                this.settings.posting.amounts.per_reply = amounts.per_reply;
                this.settings.posting.amounts.per_poll = amounts.per_poll;
                this.settings.posting.amounts.per_thread = amounts.per_thread;
            } else if(category_id && this.settings.posting.amounts.categories[category_id]){
                var amounts = this.settings.posting.amounts.categories[category_id];

                this.settings.posting.amounts.per_quick_reply = amounts.per_quick_reply;
                this.settings.posting.amounts.per_reply = amounts.per_reply;
                this.settings.posting.amounts.per_poll = amounts.per_poll;
                this.settings.posting.amounts.per_thread = amounts.per_thread;
            }

            if(!this.is_editing && !this.is_new_thread){
                if(this.using_quick_reply){
                    money_to_add += parseFloat(this.format(this.settings.posting.amounts.per_quick_reply));
                } else {
                    money_to_add += parseFloat(this.format(this.settings.posting.amounts.per_reply));
                }
            }

            if(this.is_poll){
                money_to_add += parseFloat(this.format(this.settings.posting.amounts.per_poll));
            }

            if(this.is_new_thread){
                money_to_add += parseFloat(this.format(this.settings.posting.amounts.per_thread));
            }
            
            unearned_posts = this.data(yootil.user.id()).increase.post_count(true);
            money_to_add += unearned_posts * parseFloat(this.format(this.settings.posting.amounts.per_mobile_post));

            if(!this.processed){
                this.processed = true;

                var interest_applied = this.bank.apply_interest();
                var wages_paid = this.wages.pay();
                var rank_up_paid = this.rank_up.pay();

                if(money_to_add > 0 || interest_applied || wages_paid || rank_up_paid){
                    this.data(yootil.user.id()).increase.money(money_to_add, true);
                    yootil.key.set_on(this.KEY, this.data(yootil.user.id()).get.data(), yootil.user.id(), event);
                }
            }

            /**
             * Triggers after applying money to account when they are posting.
             *
             *     $(monetary.event).on("after_apply_posting_money", function(event){
             *         console.log("do something");
             *     });
             *
             * @event after_apply_posting_money
             */

            $(monetary.event).trigger("after_apply_posting_money");
        },

        /**
         * Handles basic setup for settings.
         */

        setup: function(){
            this.route = (proboards.data("route") && proboards.data("route").name)? proboards.data("route").name.toLowerCase() : "";
            this.params = (this.route && proboards.data("route").params)? proboards.data("route").params : "";
            this.plugin = pb.plugin.get("pixeldepth_monetary");

            if(this.plugin && this.plugin.settings){
                this.images = this.plugin.images;

                var settings = this.plugin.settings;

                this.settings.show_in_mini_profile = (!! ~~ settings.show_in_mini_profile)? true : false;
                this.settings.show_money_text_mini = (!! ~~ settings.show_money_text_mini)? true : false;
                this.settings.show_money_symbol_mini = (!! ~~ settings.show_money_symbol_mini)? true : false;

                this.settings.show_in_profile = (!! ~~ settings.show_in_profile)? true : false;
                this.settings.show_money_text_profile = (!! ~~ settings.show_money_text_profile)? true : false;
                this.settings.show_money_symbol_profile = (!! ~~ settings.show_money_symbol_profile)? true : false;

                this.settings.show_in_members_list = (!! ~~ settings.show_in_members_list)? true : false;
                this.settings.show_money_symbol_members = (!! ~~ settings.show_money_symbol_members)? true : false;
                this.settings.show_bank_balance_members = (!! ~~ settings.show_bank_balance_members)? true : false;

                this.settings.text.money_column = (settings.member_list_text && settings.member_list_text.length)? settings.member_list_text : ((settings.money_text && settings.money_text.length)? settings.money_text : this.settings.text.money_column);
                this.settings.text.bank_column = (settings.bank_column_text && settings.bank_column_text.length)? settings.bank_column_text : this.settings.text.bank_column;

                this.settings.staff_edit_money = (!! ~~ settings.staff_edit_money)? true : false;
                this.settings.show_edit_money_image = (!! ~~ settings.show_edit_money_image)? true : false;

                if(settings.edit_money_image && settings.edit_money_image.length){
                    this.images.edit_money = settings.edit_money_image;
                }

                if(settings.who_can_edit_money && settings.who_can_edit_money.length){
                    this.settings.who_can_edit_money = settings.who_can_edit_money;
                }

                this.settings.check_for_update = (!! ~~ settings.check_for_update)? true : false;
                this.settings.check_how_often = (settings.check_how_often && settings.check_how_often.length)? settings.check_how_often : 2;

                this.bank.settings.enabled = (!! ~~ settings.bank_enabled)? true : false;

                this.settings.money_text = settings.money_text;
                this.settings.money_symbol = settings.money_symbol;
                this.settings.money_separator = (settings.separator && settings.separator.length)? settings.separator : this.settings.money_separator;

                this.settings.money_separator += (!! ~~ settings.separator_space)? " " : "";

                if(settings.money_symbol_image && settings.money_symbol_image.length){
                    this.settings.money_symbol = "<img class='money-sym-img' src='" + settings.money_symbol_image + "' />";
                }

                this.settings.decimal_money = (!! ~~ settings.decimal_money)? true : false;

                this.settings.posting.earn_from_quick_reply = (parseInt(settings.earn_from_quick_reply) || this.settings.posting.earn_from_quick_reply);

                this.settings.posting.amounts.per_thread = this.format(settings.money_per_thread);
                this.settings.posting.amounts.per_poll = this.format(settings.money_per_poll);
                this.settings.posting.amounts.per_reply = this.format(settings.money_per_reply);
                this.settings.posting.amounts.per_quick_reply = this.format(settings.money_per_quick_reply);
                this.settings.posting.amounts.per_mobile_post = this.format(settings.money_per_mobile_post);

                if(settings.categories_earn_amounts && settings.categories_earn_amounts.length){
                    for(var c = 0, cl = settings.categories_earn_amounts.length; c < cl; c ++){
                        var cat_earn_amounts = settings.categories_earn_amounts[c];

                        var cat_amounts = {
                            per_thread: this.format(cat_earn_amounts.money_per_thread),
                            per_poll: this.format(cat_earn_amounts.money_per_poll),
                            per_reply: this.format(cat_earn_amounts.money_per_reply),
                            per_quick_reply: this.format(cat_earn_amounts.money_per_quick_reply)
                        };

                        for(var ci = 0, cil = cat_earn_amounts.category.length; ci < cil; ci ++){
                            this.settings.posting.amounts.categories[cat_earn_amounts.category[ci]] = cat_amounts;
                        }
                    }
                }

                if(settings.boards_earn_amounts && settings.boards_earn_amounts.length){
                    for(var b = 0, bl = settings.boards_earn_amounts.length; b < bl; b ++){
                        var board_earn_amounts = settings.boards_earn_amounts[b];

                        var board_amounts = {
                            per_thread: this.format(board_earn_amounts.money_per_thread),
                            per_poll: this.format(board_earn_amounts.money_per_poll),
                            per_reply: this.format(board_earn_amounts.money_per_reply),
                            per_quick_reply: this.format(board_earn_amounts.money_per_quick_reply)
                        };

                        for(var bi = 0, bil = board_earn_amounts.board.length; bi < bil; bi ++){
                            this.settings.posting.amounts.boards[board_earn_amounts.board[bi]] = board_amounts;
                        }
                    }
                }

                this.settings.no_earn_members = settings.no_earn_members;
                this.settings.no_earn_groups = settings.no_earn_groups;
                this.settings.no_earn_categories = settings.no_earn_categories;
                this.settings.no_earn_boards = settings.no_earn_boards;
                this.settings.no_earn_threads = settings.no_earn_threads;

                this.settings.text.wallet = (settings.wallet_text && settings.wallet_text.length)? settings.wallet_text : this.settings.text.wallet;

                this.settings.notification.show = (!! ~~ settings.n_show_notification)? true : false;
                this.settings.notification.show_edited = (!! ~~ settings.n_show_edited_by)? true : false;
            }
        },

        /**
         * Checks if the user is allowed to edit another users money.  If main admin, they can edit their own.
         *
         * @return {Boolean}
         */

        is_allowed_to_edit_money: function(){
            if(!this.settings.staff_edit_money || !yootil.user.logged_in()){
                return false;
            }

            if(this.settings.who_can_edit_money.length){
                if($.inArrayLoose(yootil.user.id(), this.settings.who_can_edit_money) > -1 || yootil.user.id() == 1){
                    return true;
                }

                return false;
            } else if(yootil.user.id() == 1){
                return true;
            }

            return false;
        },

        /**
         * Binds a dialog to the money and bank values on a users profile so staff with permissions can edit those values easily.
         *
         * @param {String} element HTML element we are binding too (not really needed though).
         * @param {Number} user_id The users id we are binding to for editing.
         * @param {Boolean} bank Is this a bank bind or wallet?
         * @param {String} update_selector Selector for the element we need to update after editing money.
         * @param {String} edit_image The edit image next to the money value.
         * @return {Object} HTML elment jQuery wrapped/
         */

        bind_edit_dialog: function(element, user_id, bank, update_selector, edit_image){
            var self = this;
            var bank_edit = (bank)? true : false;
            var bank_str = (bank_edit)? "bank_" : "";
            var title = (bank_edit)? (this.bank.settings.text.bank + " Balance") : this.settings.money_text;
            var old_money = self.data(user_id).get[((bank_edit)? "bank" : "money")]();

            element = $(element);

            if(self.settings.staff_edit_money && yootil.key.write(self.KEY, user_id) && (yootil.user.id() != user_id || yootil.user.id() == 1) && this.is_allowed_to_edit_money()){
                var edit_html = "";

                edit_html += "<p>" + this.settings.money_symbol + ": <input type='text' style='width: 100px' name='edit_" + bank_str + "money' /> <button id='set_" + bank_str + "money'>Set</button> <button id='reset_" + bank_str + "money'>Reset</button></p>";
                edit_html += "<p style='margin-top: 10px;'>" + this.settings.money_symbol + ": <input type='text' style='width: 100px' name='edit_specific_" + bank_str + "money' value='" + this.format(0, true) + "' /> <button id='add_specific_" + bank_str + "money'>Add</button> <button id='remove_specific_" + bank_str + "money'>Remove</button></p>";

                edit_html = $("<span />").html(edit_html);

                element.click(function(event){
                    pb.window.dialog("edit_money", {

                        title: ("Edit " + title),
                        modal: true,
                        height: 180,
                        width: 300,
                        resizable: false,
                        draggable: false,
                        html: edit_html,

                        open: function(){
                            var key = (bank_edit)? "bank" : "money";

                            /**
                             * Triggers when opening the edit money dialog box on the profile.
                             *
                             *     $(monetary.event).on("on_open_edit_money", function(event, data){
                             *         console.log(data.type);
                             *     });
                             *
                             * @event on_open_edit_money
                             */

                            $(monetary.event).trigger("on_open_edit_money", {

                                type: key

                            });

                            var money = self.data(user_id).get[key]();

                            $(this).find("input[name=edit_" + bank_str + "money]").val(yootil.html_encode(self.format(money)));
                        },

                        buttons: {

                            Close: function(){

                                /**
                                 * Triggers when closing the edit money dialog box on the profile.
                                 *
                                 *     $(monetary.event).on("on_close_edit_money", function(event){
                                 *         console.log("do something");
                                 *     });
                                 *
                                 * @event on_close_edit_money
                                 */

                                $(monetary.event).trigger("on_close_edit_money");
                                $(this).dialog("close");
                            }

                        }

                    });

                    $(edit_html).find("button#set_" + bank_str + "money").click(function(){
                        var field = $(this).parent().find("input[name=edit_" + bank_str + "money]");
                        var value = parseFloat(field.val());
                        var key = (bank_edit)? "bank" : "money";
                        var money = parseFloat(self.data(user_id).get[key]());
                        var value_in = value_out = 0.00;

                        if(value != money){
                            self.data(user_id).set[key](value);

                            if(bank_edit){
                                if(value > money){
                                    value_in = (value - money);
                                } else {
                                    value_out = (money - value);
                                }

                                transactions = self.bank.create_transaction(4, value_in, value_out, true, value, user_id);
                                self.data(user_id).set.transactions(transactions, true);
                            }

                            if(self.settings.notification.show){
                                self.create_notification("[ME:" + ((bank_edit)? 2 : 1) + "|" + value + "|1|" + yootil.user.id() + "|" + yootil.user.name() + "]", user_id);
                                /*self.data(user_id).push.notification({

                                    type: ((bank_edit)? 2 : 1),
                                    amount: [old_money, value, 1],
                                    time: (+ new Date()),
                                    user: [yootil.user.name(), yootil.user.id()]

                                }, true);*/
                            }

                            self.data(user_id).update();

                            var update_element = (update_selector)? update_selector : (".pd_" + ((bank)? "" : "money_") + bank_str + "amount_" + user_id);

                            $(update_element).html(yootil.html_encode(self.data(user_id).get[key](true)) + (edit_image || ""));

                            if(yootil.user.id() == user_id){
                                self.sync.trigger();
                            }
                        }
                    });

                    $(edit_html).find("button#reset_" + bank_str + "money").click(function(){
                        var value = 0;
                        var key = (bank_edit)? "bank" : "money";
                        var money = self.data(user_id).get[key]();
                        var value_in = value_out = 0.00;

                        if(money != 0){
                            $(this).parent().find("input[name=edit_" + bank_str + "money]").val(self.format(0, true));

                            self.data(user_id).set[key](value);

                            if(bank_edit){
                                value_in = 0;
                                value_out = money;

                                transactions = self.bank.create_transaction(4, value_in, value_out, true, value, user_id);
                                self.data(user_id).set.transactions(transactions, true);
                            }

                            if(self.settings.notification.show){
                                self.create_notification("[ME:" + ((bank_edit)? 2 : 1) + "|" + value + "|2|" + yootil.user.id() + "|" + yootil.user.name() + "]", user_id);

                                /*self.data(user_id).push.notification({

                                    type: ((bank_edit)? 2 : 1),
                                    amount: [old_money, value, 2],
                                    time: (+ new Date()),
                                    user: [yootil.user.name(), yootil.user.id()]

                                }, true);*/
                            }

                            self.data(user_id).update();

                            var update_element = (update_selector)? update_selector : (".pd_" + ((bank)? "" : "money_") + bank_str + "amount_" + user_id);

                            $(update_element).html(yootil.html_encode(self.data(user_id).get[key](true)) + (edit_image || ""));

                            if(yootil.user.id() == user_id){
                                self.sync.trigger();
                            }
                        }
                    });

                    var add_remove_click = function(){
                        var field = $(this).parent().find("input[name=edit_specific_" + bank_str + "money]");
                        var value = parseFloat(field.val());
                        var money_type_key = (bank_edit)? "bank" : "money";
                        var value_in = value_out = 0.00;
                        var action_key = ($(this).attr("id").match("remove"))? "decrease" : "increase";

                        if(value){
                            if(action_key == "decrease"){
                                var current = self.data(user_id).get[money_type_key]();

                                //if(current == 0){
                                    //return;
                                //}

                                //if(value > current){
                                    //value = current;
                                //}
                            }

                            self.data(user_id)[action_key][money_type_key](value);

                            if(bank_edit){
                                if(action_key == "decrease"){
                                    value_out = value;
                                } else {
                                    value_in = value;
                                }

                                transactions = self.bank.create_transaction(4, value_in, value_out, true, value, user_id);
                                self.data(user_id).set.transactions(transactions, true);
                            }

                            if(self.settings.notification.show){
                                var act_type = (action_key == "increase")? 3 : 4;

                                self.create_notification("[ME:" + ((bank_edit)? 2 : 1) + "|" + value + "|" + act_type + "|" + yootil.user.id() + "|" + yootil.user.name() + "]", user_id);

                                /*self.data(user_id).push.notification({

                                    type: ((bank_edit)? 2 : 1),
                                    amount: [old_money, value, act_type],
                                    time: (+ new Date()),
                                    user: [yootil.user.name(), yootil.user.id()]

                                }, true);*/
                            }

                            self.data(user_id).update();

                            var update_element = (update_selector)? update_selector : (".pd_" + ((bank)? "" : "money_") + bank_str + "amount_" + user_id);

                            $(update_element).html(yootil.html_encode(self.data(user_id).get[money_type_key](true)) + (edit_image || ""));

                            if(yootil.user.id() == user_id){
                                self.sync.trigger();
                            }
                        }
                    };

                    var add = $(edit_html).find("button#add_specific_" + bank_str + "money");
                    var remove = $(edit_html).find("button#remove_specific_" + bank_str + "money");

                    add.click(add_remove_click);
                    remove.click(add_remove_click);
                }).css("cursor", "pointer").attr("title", "Edit " + title);
            }

            return element;
        },

        /**
         * Adds money and bank money to the members list.
         */

        show_in_members_list: function(no_th){
            if($("td[class^=pd_money_]").length){
                return;
            }

            this.refresh_user_data_table();

            var self = this;
            var table = $("div.content.cap-bottom table.list");

            if(table.find("th.pd_money_th").length == 0){
                $("<th class=\"pd_money_th sortable\" style=\"width: 12%\">" + this.settings.text.money_column + "</th>").insertAfter(table.find("tr.head th.posts"));
            }

            if(this.bank.settings.enabled && this.settings.show_bank_balance_members && this.is_allowed_to_edit_money()){
                if(table.find("th.pd_money_bank_th").length == 0){
                    $("<th class=\"pd_money_bank_th sortable\" style=\"width: 12%\">" + this.settings.text.bank_column + "</th>").insertAfter(table.find("tr.head th.pd_money_th"));
                }
            }

            table.find("tr.member[id=*member]").each(function(){
                if(this.id.match(/^member\-(\d+)/i)){
                    var user_id = RegExp.$1;
                    var user_money = self.data(user_id).get.money(true);
                    var money_sym = (self.settings.show_money_symbol_members)? self.settings.money_symbol : "";
                    var td = $("<td class=\"pd_money_" + user_id + "\"><span class=\"pd_money_symbol\">" + money_sym + "</span><span class=\"pd_money_amount_" + user_id + "\">" + yootil.html_encode(user_money) + "</span></td>");

                    td.insertAfter($(this).find("td.posts"));

                    if(self.bank.settings.enabled && self.settings.show_bank_balance_members && self.is_allowed_to_edit_money()){
                        var user_bank = self.data(user_id).get.bank(true);
                        var td = $("<td class=\"pd_bank_" + user_id + "\"><span class=\"pd_money_symbol\">" + money_sym + "</span><span class=\"pd_bank_amount_" + user_id + "\">" + yootil.html_encode(user_bank) + "</span></td>");

                        td.insertAfter($(this).find("td.pd_money_" + user_id));
                    }
                }
            });
        },

        /**
         * Checks to see if the forum is using custom elements for the money.
         *
         * @param {Object} container jQuery wrapped container to look in for the elements.
         * @param {Number} user_money The users money amount.
         * @param {String} edit_image Used on the profile page for editing users money.
         * @param {String} money_text The money text to be inserted into the custom elements.
         * @param {String} money_symbol The money symbol to be inserted into the custom elements.
         * @param {Number} user_id Used to help bind the edit dialog.
         * @param {Object} context The object which has the bind dialog setup.
         * @return {Boolean} If there are custom elements, we return true.
         */

        custom_money_tpl: function(container, user_money, edit_image, money_text, money_symbol, user_id, context){
            var money_text_cust = container.find(".money_text");
            var money_symbol_cust = container.find(".money_symbol");
            var money_amount_cust = container.find(".money_amount");

            if(money_text_cust.length || money_symbol_cust.length || money_amount_cust.length){
                if(money_text_cust.length){
                    money_text_cust.append(money_text).addClass("pd_money_text_" + user_id);
                }

                if(money_symbol_cust.length){
                    money_symbol_cust.append(money_symbol).addClass("pd_money_symbol_" + user_id);
                }

                if(money_amount_cust.length){
                    money_amount_cust.append(user_money + edit_image).addClass("pd_money_amount_" + user_id);

                    if(edit_image){
                        context.bind_edit_dialog(money_amount_cust, user_id, false, ".pd_money_amount_" + user_id, edit_image);
                    }
                }

                return true;
            }

            return false;
        },

        /**
         * Checks to see if the forum is using custom elements for the bank value.
         *
         * @param {Object} container jQuery wrapped container to look in for the elements.
         * @param {Number} user_bank_money The users bank amount.
         * @param {String} edit_image Used on the profile page for editing users bank value.
         * @param {String} bank_text The bank text to be inserted into the custom elements.
         * @param {Boolean} show_bank_balance Do we want to show the bank balance.
         * @param {String} money_symbol The money symbol to be inserted into the custom elements.
         * @param {Number} user_id Used to help bind the edit dialog.
         * @param {Object} context The object which has the bind dialog setup.
         * @return {Boolean} If there are custom elements, we return true.
         */

        custom_bank_tpl: function(container, user_bank_money, edit_image, bank_text, show_bank_balance, money_symbol, user_id, context){
            if(show_bank_balance){
                var bank_text_cust = container.find(".bank_text");
                var bank_symbol_cust = container.find(".bank_symbol");
                var bank_amount_cust = container.find(".bank_amount");

                if(bank_text_cust.length || bank_symbol_cust.length || bank_amount_cust.length){
                    using_custom = true;

                    if(bank_text_cust.length){
                        bank_text_cust.append(bank_text).addClass("pd_bank_text_" + user_id);
                    }

                    if(bank_symbol_cust.length){
                        bank_symbol_cust.append(money_symbol).addClass("pd_bank_symbol_" + user_id);
                    }

                    if(bank_amount_cust.length){
                        bank_amount_cust.append(user_bank_money + edit_image).addClass("pd_bank_amount_" + user_id);

                        if(edit_image){
                            context.bind_edit_dialog(bank_amount_cust, user_id, true, ".pd_bank_amount_" + user_id, edit_image);
                        }
                    }

                    return true;
                }
            }

            return false;
        },

        /**
         * Checks to see if the forum is using custom elements for donations sent.
         *
         * @param {Object} container jQuery wrapped container to look in for the elements.
         * @param {Number} user_donations_sent The users donations sent amount.
         * @param {String} sent_text The sent text to be inserted into the custom elements.
         * @param {String} money_symbol The money symbol to be inserted into the custom elements.
         * @param {Number} user_id Gets added to the class.
         * @return {Boolean} If there are custom elements, we return true.
         */

        custom_donations_sent_tpl: function(container, user_donations_sent, sent_text, money_symbol, user_id){
            if(this.donation.settings.show_total_sent_profile){
                var donations_sent_cust = container.find(".donations_sent_text");
                var donations_sent_symbol_cust = container.find(".donations_sent_symbol");
                var donations_sent_amount_cust = container.find(".donations_sent_amount");

                if(donations_sent_cust.length || donations_sent_symbol_cust.length || donations_sent_amount_cust.length){
                    using_custom = true;

                    if(donations_sent_cust.length){
                        donations_sent_cust.append(sent_text).addClass("pd_donations_sent_text_" + user_id);
                    }

                    if(donations_sent_symbol_cust.length){
                        donations_sent_symbol_cust.append(money_symbol).addClass("pd_donations_sent_symbol_" + user_id);
                    }

                    if(donations_sent_amount_cust.length){
                        donations_sent_amount_cust.append(user_donations_sent).addClass("pd_donations_sent_amount_" + user_id);
                    }

                    return true;
                }
            }

            return false;
        },

        /**
         * Checks to see if the forum is using custom elements for donations received.
         *
         * @param {Object} container jQuery wrapped container to look in for the elements.
         * @param {Number} user_donations_received The users donations received amount.
         * @param {String} received_text The received text to be inserted into the custom elements.
         * @param {String} money_symbol The money symbol to be inserted into the custom elements.
         * @param {Number} user_id Gets added to the class.
         * @return {Boolean} If there are custom elements, we return true.
         */

        custom_donations_received_tpl: function(container, user_donations_received, received_text, money_symbol, user_id){
            if(this.donation.settings.show_total_received_profile){
                var donations_received_cust = container.find(".donations_received_text");
                var donations_received_symbol_cust = container.find(".donations_received_symbol");
                var donations_received_amount_cust = container.find(".donations_received_amount");

                if(donations_received_cust.length || donations_received_symbol_cust.length || donations_received_amount_cust.length){
                    using_custom = true;

                    if(donations_received_cust.length){
                        donations_received_cust.append(received_text).addClass("pd_donations_received_text_" + user_id);
                    }

                    if(donations_received_symbol_cust.length){
                        donations_received_symbol_cust.append(money_symbol).addClass("pd_donations_received_symbol_" + user_id);
                    }

                    if(donations_received_amount_cust.length){
                        donations_received_amount_cust.append(user_donations_received).addClass("pd_donations_received_amount_" + user_id);
                    }

                    return true;
                }
            }

            return false;
        },

        /**
         * Adds money and bank money to the members profile, also handles sent and received donations amounts if enabled.
         */

        show_in_profile: function(){
            var user_money = this.data(this.params.user_id).get.money(true);
            var user_bank_money = this.data(this.params.user_id).get.bank(true);
            var user_donations_sent = this.data(this.params.user_id).get.total_sent_donations(true);
            var user_donations_received = this.data(this.params.user_id).get.total_received_donations(true);

            var edit_image = (this.settings.show_edit_money_image)? (" <img class='money-edit-image' src='" + this.images.edit_money + "' title='Edit' />") : "";
            var bank_image = (this.settings.show_edit_money_image)? (" <a href='?bank'><img class='other-bank-view-image' src='" + this.images.bank + "' title='Transactions' /></a>") : "";

            if(!this.is_allowed_to_edit_money() || (this.params.user_id == yootil.user.id() && yootil.user.id() != 1)){
                edit_image = "";
                bank_image = "";
            }

            var money_symbol = (this.settings.show_money_symbol_profile)? this.settings.money_symbol : "";
            var money_text = (this.settings.show_money_text_profile)? this.settings.money_text : "";
            var bank_text = (this.bank.settings.text.bank)? this.bank.settings.text.bank : "";
            var donations_received_text = (this.donation.settings.text.donations)? this.donation.settings.text.donations : "";
            var donations_sent_text = (this.donation.settings.text.donations)? this.donation.settings.text.donations : "";
            var using_custom = false;
            var show_bank_balance = false;
            var container = $("div.container.show-user");

            if(money_text.toString().length){
                money_text += this.settings.money_separator;
            }

            if(bank_text.toString().length){
                bank_text += " Balance" + this.settings.money_separator;
            }

            if(donations_sent_text.toString().length){
                donations_sent_text += " Sent" + this.settings.money_separator;
            }

            if(donations_received_text.toString().length){
                donations_received_text += " Received" + this.settings.money_separator;
            }

            if(this.bank.settings.enabled && this.bank.settings.show_bank_profile){
                if((this.bank.settings.show_bank_staff_only && yootil.user.is_staff()) || !this.bank.settings.show_bank_staff_only){
                    show_bank_balance = true;
                }
            }

            using_custom = (this.custom_money_tpl(container, user_money, edit_image, money_text, money_symbol, this.params.user_id, this))? true : using_custom;

            using_custom = (this.custom_bank_tpl(container, user_bank_money, edit_image, bank_text, show_bank_balance, money_symbol, this.params.user_id, this))? true : using_custom;

            using_custom = (this.custom_donations_sent_tpl(container, user_donations_sent, donations_sent_text, money_symbol, this.params.user_id, this))? true : using_custom;

            using_custom = (this.custom_donations_received_tpl(container, user_donations_received, donations_received_text, money_symbol, this.params.user_id, this))? true : using_custom;

            if(!using_custom){
                var post_head = $("div.content-box.center-col td.headings:contains(Posts)");

                if(post_head.length){
                    var row = post_head.parent();

                    if(row){
                        if(this.donation.settings.enabled){
                            if(this.donation.settings.show_total_received_profile){
                                var donations_received_td = $("<td class=\"pd_donations_received_" + this.params.user_id + "\"><span class=\"pd_money_symbol\">" + money_symbol + "</span><span class=\"pd_donations_received_amount_" + this.params.user_id + "\">" + yootil.html_encode(user_donations_received) + "</span></td>");

                                $("<tr/>").html("<td>" + donations_received_text + "</td>").append(donations_received_td).insertAfter(row);
                            }

                            if(this.donation.settings.show_total_sent_profile){
                                var donations_sent_td = $("<td class=\"pd_donations_sent_" + this.params.user_id + "\"><span class=\"pd_money_symbol\">" + money_symbol + "</span><span class=\"pd_donations_sent_amount_" + this.params.user_id + "\">" + yootil.html_encode(user_donations_sent) + "</span></td>");

                                $("<tr/>").html("<td>" + donations_sent_text + "</td>").append(donations_sent_td).insertAfter(row);
                            }
                        }

                        if(show_bank_balance){
                            var bank_td = this.bind_edit_dialog("<td class=\"pd_bank_money_" + this.params.user_id + "\"><span class=\"pd_bank_money_symbol\">" + money_symbol + "</span><span class=\"pd_bank_amount_" + this.params.user_id + "\">" + yootil.html_encode(user_bank_money) + "</span>" + edit_image + "</td>", this.params.user_id, true);

                            $("<tr/>").html("<td>" + bank_text + bank_image + "</td>").append(bank_td).insertAfter(row);
                        }

                        var money_td = this.bind_edit_dialog("<td class=\"pd_money_" + this.params.user_id + "\"><span class=\"pd_money_symbol\">" + money_symbol + "</span><span class=\"pd_money_amount_" + this.params.user_id + "\">" + yootil.html_encode(user_money) + "</span>" + edit_image + "</td>", this.params.user_id, false);

                        $("<tr/>").html("<td>" + money_text + "</td>").append(money_td).insertAfter(row);
                    }
                }
            }
        },

        /**
         * Adds money to members mini profile.  Also handles bank, donations sent and received.
         */

        show_in_mini_profile: function(){
            var minis = $("div.mini-profile");

            if(minis && minis.length){
                if(minis.find("div.info span[class*=pd_money_]").length){
                    return;
                }

                this.refresh_user_data_table();

                var self = this;
                var money_text = (this.settings.show_money_text_mini)? this.settings.money_text : "";
                var money_symbol = (this.settings.show_money_symbol_mini)? this.settings.money_symbol : "";
                var bank_text = (this.bank.settings.text.bank)? this.bank.settings.text.bank : "";
                var donations_received_text = (this.donation.settings.text.donations)? this.donation.settings.text.donations : "";
                var donations_sent_text = (this.donation.settings.text.donations)? this.donation.settings.text.donations : "";

                if(money_text.toString().length){
                    money_text += this.settings.money_separator;
                }

                if(bank_text.toString().length){
                    bank_text += " Balance" + this.settings.money_separator;
                }

                if(donations_sent_text.toString().length){
                    donations_sent_text += " Sent" + this.settings.money_separator;
                }

                if(donations_received_text.toString().length){
                    donations_received_text += " Received" + this.settings.money_separator;
                }

                var show_bank_balance = false;

                if(self.bank.settings.enabled && self.bank.settings.show_bank_mini_profile){
                    if((self.bank.settings.show_bank_staff_only && yootil.user.is_staff()) || !self.bank.settings.show_bank_staff_only){
                        show_bank_balance = true;
                    }
                }

                minis.each(function(){
                    var user_link = $(this).find("a.user-link[href*='user']:first");

                    if(user_link && user_link.length){
                        var user_id_match = user_link.attr("href").match(/\/user\/(\d+)\/?/i);

                        if(user_id_match && user_id_match.length == 2){
                            var user_id = parseInt(user_id_match[1]);

                            if(!user_id){
                                return;
                            }

                            var money = self.data(user_id).get.money(true);
                            var user_bank_money = self.data(user_id).get.bank(true);
                            var user_donations_sent = self.data(user_id).get.total_sent_donations(true);
                            var user_donations_received = self.data(user_id).get.total_received_donations(true);
                            var using_custom = false;

                            using_custom = (self.custom_money_tpl($(this), money, "", money_text, money_symbol, user_id, self))? true : using_custom;

                            using_custom = (self.custom_bank_tpl($(this), user_bank_money, "", bank_text, show_bank_balance, money_symbol, user_id, self))? true : using_custom;

                            using_custom = (self.custom_donations_sent_tpl($(this), user_donations_sent, donations_sent_text, money_symbol, user_id, self))? true : using_custom;

                            using_custom = (self.custom_donations_received_tpl($(this), user_donations_received, donations_received_text, money_symbol, user_id, self))? true : using_custom;

                            if(!using_custom){
                                var info = $(this).find("div.info");

                                if(info && info.length){
                                    var div = info.get(0);
                                    var str = "";

                                    str += "<span class=\"pd_money_text_" + user_id + "\">" + money_text + "</span>";
                                    str += "<span class=\"pd_money_symbol_" + user_id + "\">" + money_symbol + "</span>";
                                    str += "<span class=\"pd_money_amount_" + user_id + "\">" + yootil.html_encode(money) + "</span><br />";

                                    if(show_bank_balance){
                                        str += "<span class=\"pd_bank_text_" + user_id + "\">" + bank_text + "</span>";
                                        str += "<span class=\"pd_bank_symbol_" + user_id + "\">" + money_symbol + "</span>";
                                        str += "<span class=\"pd_bank_amount_" + user_id + "\">" + yootil.html_encode(user_bank_money) + "</span><br />";
                                    }

                                    if(self.donation.settings.enabled){
                                        if(self.donation.settings.show_total_sent_mini_profile){
                                            str += "<span class=\"pd_donations_sent_text_" + user_id + "\">" + donations_sent_text + "</span>";
                                            str += "<span class=\"pd_donations_sent_symbol_" + user_id + "\">" + money_symbol + "</span>";
                                            str += "<span class=\"pd_donations_sent_amount_" + user_id + "\">" + yootil.html_encode(user_donations_sent) + "</span><br />";
                                        }

                                        if(self.donation.settings.show_total_received_mini_profile){
                                            str += "<span class=\"pd_donations_received_text_" + user_id + "\">" + donations_received_text + "</span>";
                                            str += "<span class=\"pd_donations_received_symbol_" + user_id + "\">" + money_symbol + "</span>";
                                            str += "<span class=\"pd_donations_received_amount_" + user_id + "\">" + yootil.html_encode(user_donations_received) + "</span><br />";
                                        }
                                    }

                                    $(div).prepend(str);
                                }
                            }
                        }
                    }
                });
            }
        },

        /**
         * Checks if there are any old notifications so they can be removed.  Also creates an instance of
         * the new yootil notification class.
         */

        check_for_notifications: function(){

            // Need to check old notifications and remove them

            var notifications = this.data(yootil.user.id()).get.notifications();

            if(notifications.length){
                this.data(yootil.user.id()).clear.notifications(false, null, true);
            }

            // Now we can setup yootil notifications

            if(typeof yootil.notifications != "undefined"){
                this.notify = new yootil.notifications("monetary_notifications");
            }
        }

    };

    /**
     * @class monetary.bank
     * @static
     *
     * Allows members to store money in the bank, deposit, withdraw, and earn interest.
     */

    money.bank = (function(){

        return {

            /**
             * @property {Object} settings Default settings for this module that can be overwritten in setup.
             * @property {Boolean} settings.enabled Module enabled or not.
             * @property {Number} settings.interest The default interest rate.
             * @property {Boolean} settings.compact Uses a more compact HTML template for forums with smaller widths.
             * @property {Number} settings.minimum_deposit The min amount allowed to be deposited.
             * @property {Number} settings.minimum_withdraw The min amount allowed to be withdrawn.
             * @property {Boolean} settings.show_bank_mini_profile If true, the bank value will be shown in the mini profile.
             * @property {Boolean} settings.show_bank_profile If true, the bank value will be shown on the profile.
             * @property {Boolean} settings.show_bank_staff_only If true, the bank value will only show for staff.
             * @property {Object} settings.text Default text used throughout the module.
             * @property {String} settings.text.bank
             * @property {String} settings.text.interest_rate
             * @property {String} settings.text.withdraw
             * @property {String} settings.text.deposit
             * @property {String} settings.text.transactions
             * @property {String} settings.text.savings_account
             * @property {String} settings.text.account_number
             * @property {String} settings.text.sort_code
             * @property {Object} settings.text.types Used with transactions to show the type.
             * @property {String} settings.text.types.DEPOSIT
             * @property {String} settings.text.types.WITHDRAW
             * @property {String} settings.text.types.INTEREST
             * @property {String} settings.text.types.STAFFEDIT
             * @property {String} settings.text.types.WAGES
             * @property {String} settings.text.types.RANKUP
             * @property {String} settings.text.types.STAFFWAGES
             * @property {String} settings.text.types.GIFTMONEY
             */

            settings: {

                enabled: true,
                interest: 0.00,
                compact: false,
                minimum_deposit: 0.01,
                minimum_withdraw: 0.01,

                show_bank_mini_profile: false,
                show_bank_profile: true,
                show_bank_staff_only: true,

                text: {

                    bank: "Bank",
                    interest_rate: "Interest Rate",
                    withdraw: "Withdraw",
                    deposit: "Deposit",
                    transactions: "Transactions",
                    savings_account: "Savings Account",
                    account_number: "Account Number",
                    sort_code: "Sort Code",

                    types: {

                        DEPOSIT: "DEPOSIT",
                        WITHDRAW: "WITHDRAW",
                        INTEREST: "INTEREST",
                        STAFFEDIT: "STAFFEDIT",
                        WAGES: "WAGES",
                        RANKUP: "RANKUP",
                        STAFFWAGES: "STAFFWAGES",
                        GIFTMONEY: "GIFTMONEY"

                    }
                }

            },

            /**
             * Registers this module to the money class.
             * @returns {Object}
             */

            register: function(){
                money.modules.push(this);
                return this;
            },

            /**
             * This is called from the main class.  Each module gets registered and a loop goes through and calls this.
             */

            init: function(){
                this.setup();

                if(!yootil.user.logged_in()){
                    return;
                }

                if(this.settings.enabled){
                    if(money.images.bank){
                        yootil.bar.add("/?bank", money.images.bank, "Bank", "pdmsbank");
                    }
                }

                if(yootil.location.home() && location.href.match(/\/\?bank\/?/i)){
                    if(this.settings.enabled){
                        this.start();
                        money.can_show_default = false;
                    } else {
                        money.show_default();
                    }
                }
                else if (yootil.location.profile_home()  && location.href.match(/\?bank\/?/i) && money.settings.staff_edit_money && money.is_allowed_to_edit_money()){
                    var id = money.params.user_id;
                    yootil.create.page(new RegExp("\\/user\\/" + id + "\\?bank"), "View Transactions");
                    $("#content").empty();
                    yootil.create.nav_branch("/user/" + id + "?bank", "View Transactions");
                    this.show_transaction_list();
                }
            },

            /**
             * Creates the bank page and builds the HTML to be shown.
             */

            show_transaction_list: function(){
                var self = this;

                var html = "";

                var trans_html = "";

                trans_html += '<table id="bank-transaction-list">';
                var transactions = this.get_transactions(money.params.user_id);

                if(!transactions.length){
                    trans_html += '<tr class="bank-transaction-list-row"><td><em>There are no ' + this.settings.text.transactions.toLowerCase() + ' to view.</td></tr>';
                } else {
                    trans_html += this.get_transaction_html_headers();

                    var counter = 0;

                    for(var t = 0, l = transactions.length; t < l; t ++){
                        var type = "";
                        var balance = transactions[t][4];

                        switch(transactions[t][0]){

                            case 1 :
                                type = this.settings.text.types.DEPOSIT;
                                break;

                            case 2 :
                                type = this.settings.text.types.WITHDRAW;
                                break;

                            case 3 :
                                type = this.settings.text.types.INTEREST;
                                break;

                            case 4 :
                                type = this.settings.text.types.STAFFEDIT;
                                break;

                            case 5 :
                                type = this.settings.text.types.WAGES;
                                break;

                            case 6 :
                                type = this.settings.text.types.RANKUP;
                                break;

                            case 7 :
                                type = this.settings.text.types.STAFFWAGES;
                                break;

                            case 8 :
                                type = this.settings.text.types.GIFTMONEY;
                                break;

                            default:
                                if (transactions[t][0] >= 9){
                                    if (transactions[t][0] % 5 == 0) {
                                        type = "RECEIVE FROM USER #" + (transactions[t][0] - 5)/5;
                                    } else if (transactions[t][0] % 5 == 1){
                                        type = "DONATE TO USER #" + (transactions[t][0] - 1 - 5)/5;
                                    }
                                }
                                break;

                        }

                        var in_amount = (transactions[t][1] > 0)? transactions[t][1] : "--";
                        var out_amount = (transactions[t][2] > 0)? transactions[t][2] : "--";
                        var date_str = this.format_transaction_date(transactions[t][3]);

                        trans_html += '<tr class="bank-transaction-list-row">';
                        trans_html += '<td>' + date_str + '</td>';
                        trans_html += '<td>' + type + '</td>';
                        trans_html += '<td>' + yootil.html_encode(yootil.number_format(money.format(in_amount, true))) + '</td>';
                        trans_html += '<td>' + yootil.html_encode(yootil.number_format(money.format(out_amount, true))) + '</td>';
                        trans_html += '<td>' + yootil.html_encode(yootil.number_format(money.format(balance, true))) + '</td>';
                        trans_html += '</tr>';

                        counter ++;
                    }
                }

                trans_html += '</table>';

                var self = this;
                var trans = yootil.create.container("Recent " + this.settings.text.transactions, trans_html);

                trans.show().appendTo("#content");
            },



            start: function(){
                var self = this;

                yootil.create.page("?bank", this.settings.text.bank);
                yootil.create.nav_branch("/?bank", this.settings.text.bank);

                var account_number = this.get_account_number();
                var sort_code = this.get_sort_code();
                var html = "";

                html += '<div id="bank-overview-wrapper"><div id="bank-coin-image"><img src="' + money.images.coins + '"></div>';
                html += '<div id="bank-overview-inner">';

                html += '<div id="bank-overview-details">';
                html += '<strong>' + this.settings.text.savings_account + '</strong><br />';
                html += '<span id="bank-overview-details-account-number">' + this.settings.text.account_number + ': ' + account_number + '</span><br />';
                html += '<span id="bank-overview-details-sort-code">' + this.settings.text.sort_code + ': ' + sort_code + '</span><br /><br />';
                html += '<span id="bank-overview-details-money">' + money.settings.money_symbol + '<span id="pd_money_bank_balance">' + yootil.html_encode(money.data(yootil.user.id()).get.bank(true)) + '</span></span>';
                html += '</div>';

                html += '<div id="bank-controls">';
                html += '<div id="bank-error"><span id="pd_money_bank_error"></span></div>';
                html += '<div id="bank-controls-buttons-wrapper">';

                // I know, it's bad, but IE annoyed me.
                var _top = ($.browser.msie)? "0" : "-2";

                html += '<input type="text" value="' + money.format(0, true) + '" id="pd_money_withdraw">';
                html += ' <a id="pd_money_withdraw_button" class="button" href="#" role="button" style="top: ' + _top + 'px;">' + this.settings.text.withdraw + '</a>';
                html += '<input type="text" value="' + money.format(0, true) + '" id="pd_money_deposit">';
                html += ' <a id="pd_money_deposit_button" class="button" href="#" role="button" style="top: ' + _top + 'px;">' + this.settings.text.deposit + '</a>';
                html += '</div>';

                html += '</div>';

                html += '<br class="clear" />';

                html += '</div>';
                html += '</div>';

                var title = '<div>';

                title += '<div style="float: left">' + this.settings.text.bank + ' (' + this.settings.text.interest_rate + ': ' + this.settings.interest.toString() + '%)</div>';
                title += '<div style="float: right" id="pd_money_wallet">' + money.settings.text.wallet + ': ' + money.settings.money_symbol + '<span id="pd_money_wallet_amount">' + yootil.html_encode(money.data(yootil.user.id()).get.money(true)) + '</span></div>';

                title += '</div><br style="clear: both" />';

                var container = yootil.create.container(title, html);

                container.find("input#pd_money_deposit").focus(function(){
                    $(this).val("");
                });

                container.find("input#pd_money_deposit").blur(function(){
                    if(!$(this).val().length){
                        $(this).val(money.format(0, true));
                    }
                });

                container.find("input#pd_money_withdraw").focus(function(){
                    $(this).val("");
                });

                container.find("input#pd_money_withdraw").blur(function(){
                    if(!$(this).val().length){
                        $(this).val(money.format(0, true));
                    }
                });

                container.find("a#pd_money_deposit_button").click(function(){
                    var input = container.find("input#pd_money_deposit");
                    var value = input.val();

                    if(!value.match(/^\d+(\.\d{1,2})?$/)){
                        self.bank_error(self.settings.text.deposit + " value must be a number (i.e 56, or 56.22).");
                    } else {
                        if(parseFloat(value) >= parseFloat(self.settings.minimum_deposit)){
                            var current_amount = money.data(yootil.user.id()).get.money();

                            if(value > parseFloat(current_amount)){
                                self.bank_error("You do not have enough to " + self.settings.text.deposit.toLowerCase() + " that amount.");
                            } else {

                                /**
                                 * Triggers when a deposit is made into the bank account.
                                 *
                                 *     $(monetary.event).on("bank.deposit", function(event, data){
                                  *         console.log(data.amount);
                                  *     });
                                 *
                                 * @event deposit
                                 */

                                $(monetary.event).trigger("bank.deposit", {

                                    amount: value

                                });

                                self.deposit(value);
                                input.val(money.format(0, true));

                                // Trigger syncing for other tabs

                                money.sync.trigger();
                            }
                        } else {
                            self.bank_error(self.settings.text.deposit + " value can't be less than " + money.format(self.settings.minimum_deposit, true) + ".");
                        }
                    }

                    return false;
                });

                container.find("a#pd_money_withdraw_button").click(function(){
                    var input = container.find("input#pd_money_withdraw");
                    var value = input.val();

                    if(!value.match(/^\d+(\.\d{1,2})?$/)){
                        self.bank_error(self.settings.text.withdraw + " value must be a number (i.e 56, or 56.22).");
                    } else {
                        if(parseFloat(value) >= parseFloat(self.settings.minimum_withdraw)){
                            var current_amount = money.data(yootil.user.id()).get.bank();

                            if(value > parseFloat(current_amount)){
                                self.bank_error("You do not have enough in the " + self.settings.text.bank.toLowerCase() + " to " + self.settings.text.withdraw.toLowerCase() + " that amount.");
                            } else {

                                /**
                                 * Triggers when a withdraw is made into the bank account.
                                 *
                                 *     $(monetary.event).on("bank.withdraw", function(event, data){
                                  *         console.log(data.amount);
                                  *     });
                                 *
                                 * @event withdraw
                                 */

                                $(monetary.event).trigger("bank.withdraw", {

                                    amount: value

                                });

                                self.withdraw(value);
                                input.val(money.format(0, true));

                                // Trigger syncing for other tabs

                                money.sync.trigger();
                            }
                        } else {
                            self.bank_error(self.settings.text.withdraw + " value can't be less than " + money.format(self.settings.minimum_withdraw, true) + ".");
                        }
                    }

                    return false;
                });

                container.show().appendTo("#content").find("div.content");

                self.show_transaction_list();
            },

            /**
             * Handles overwriting default values.  These come from the plugin settings.
             */

            setup: function(){
                if(money.plugin){
                    var settings = money.plugin.settings;

                    this.settings.enabled = (!! ~~ settings.bank_enabled)? true : false;
                    this.settings.interest = (settings.interest_rate.toString().length)? settings.interest_rate : "1.00";
                    this.settings.minimum_deposit = money.format(settings.minimum_deposit);
                    this.settings.minimum_withdraw = money.format(settings.minimum_withdraw);

                    if(settings.coin_image && settings.coin_image.length){
                        money.images.coins = settings.coin_image;
                    }

                    if(settings.bank_icon && settings.bank_icon.length){
                        money.images.bank = settings.bank_icon;
                    }

                    // Protection incase admin makes a mistake

                    if(this.settings.minimum_deposit < 1){
                        if(!money.settings.decimal_money){
                            this.settings.minimum_deposit = 1;
                        } else if(this.settings.minimum_deposit <= 0){
                            this.settings.minimum_deposit = 0.01;
                        }
                    }

                    if(this.settings.minimum_withdraw < 1){
                        if(!money.settings.decimal_money){
                            this.settings.minimum_withdraw = 1;
                        } else if(this.settings.minimum_withdraw <= 0){
                            this.settings.minimum_withdraw = 0.01;
                        }
                    }

                    this.settings.text.bank = (settings.bank_text && settings.bank_text.length)? settings.bank_text : this.settings.text.bank;
                    this.settings.text.interest_rate = (settings.interest_rate_text && settings.interest_rate_text.length)? settings.interest_rate_text : this.settings.text.interest_rate;
                    this.settings.text.withdraw = (settings.withdraw_text && settings.withdraw_text.length)? settings.withdraw_text : this.settings.text.withdraw;
                    this.settings.text.deposit = (settings.deposit_text && settings.deposit_text.length)? settings.deposit_text : this.settings.text.deposit;
                    this.settings.text.transactions = (settings.transactions_text && settings.transactions_text.length)? settings.transactions_text : this.settings.text.transactions;
                    this.settings.text.savings_account = (settings.savings_account_text && settings.savings_account_text.length)? settings.savings_account_text : this.settings.text.savings_account;
                    this.settings.text.account_number = (settings.account_number_text && settings.account_number_text.length)? settings.account_number_text : this.settings.text.account_number;
                    this.settings.text.sort_code = (settings.sort_code_text && settings.sort_code_text.length)? settings.sort_code_text : this.settings.text.sort_code;

                    this.settings.text.types.WITHDRAW = (settings.type_withdraw_text && settings.type_withdraw_text.length)? settings.type_withdraw_text : this.settings.text.types.WITHDRAW;
                    this.settings.text.types.DEPOSIT = (settings.type_deposit_text && settings.type_deposit_text.length)? settings.type_deposit_text : this.settings.text.types.DEPOSIT;
                    this.settings.text.types.INTEREST = (settings.type_interest_text && settings.type_interest_text.length)? settings.type_interest_text : this.settings.text.types.INTEREST;
                    this.settings.text.types.STAFFEDIT = (settings.type_staffedit_text && settings.type_staffedit_text.length)? settings.type_staffedit_text : this.settings.text.types.STAFFEDIT;
                    this.settings.text.types.WAGES = (settings.type_wages_text && settings.type_wages_text.length)? settings.type_wages_text : this.settings.text.types.WAGES;
                    this.settings.text.types.RANKUP = (settings.type_rankup_text && settings.type_rankup_text.length)? settings.type_rankup_text : this.settings.text.types.RANKUP;
                    this.settings.text.types.STAFFWAGES = (settings.type_staff_wages_text && settings.type_staff_wages_text.length)? settings.type_staff_wages_text : this.settings.text.types.STAFFWAGES;
                    this.settings.text.types.GIFTMONEY = (settings.type_gift_money_text && settings.type_gift_money_text.length)? settings.type_gift_money_text : this.settings.text.types.GIFTMONEY;

                    this.settings.show_bank_mini_profile = (!! ~~ settings.bank_mini_profile)? true : false;
                    this.settings.show_bank_profile = (!! ~~ settings.bank_profile)? true : false;
                    this.settings.show_bank_staff_only = (!! ~~ settings.bank_view_staff_only)? true : false;
                }
            },

            /**
             * If interest is enabled, then we apply it by looking at the last time they earned interest.
             *
             * @returns Boolean
             */

            apply_interest: function(){
                if(!this.settings.enabled){
                    return false;
                }

                var user_id = yootil.user.id();
                var balance = money.data(user_id).get.bank();
                var last_date = money.data(user_id).get.interest() || "";
                var now = new Date();
                var day = now.getDate();
                var month = (now.getMonth() + 1);
                var year = now.getFullYear();
                var today = (day + "/" + month + "/" + year);

                if(last_date != today){
                    this.setup();

                    var interest = ((parseFloat(balance) * parseFloat(this.settings.interest)) / 100);

                    money.data(user_id).set.interest(today, true);

                    if(balance > 0 && interest > 0){
                        money.data(user_id).increase.bank(parseFloat(interest.toFixed(2)), true);
                        this.create_transaction(3, interest, 0, true);

                        return true;
                    }
                }

                return false;
            },

            /**
             * Formats the date for the transaction so it matches the uses date format settings, but is also shorthand.
             *
             * @param {Number} date The timestamp to be formatted.
             * @param {String} format This is no longer used, we get the format via Yootil.
             * @returns {String} The date formatted.
             */

            format_transaction_date: function(date, format){
                var date = new Date(date);
                var date_str = "";
                var date_obj = {

                    d: yootil.pad(date.getDate(), 2),
                    m: yootil.pad((date.getMonth() + 1), 2),
                    y: date.getFullYear()

                };

                var format = yootil.user.date_format();

                if(format.length){
                    var parts = format.split("/");
                    var date_elems = [];

                    for(var p = 0, pl = parts.length; p < pl; p ++){
                        date_elems.push(date_obj[parts[p]]);
                    }

                    date_str = date_elems.join("/");
                } else {
                    date_str = date_obj.d + "/" + date_obj.m + "/" + date_obj.y;
                }

                return date_str;
            },

            /**
             * Builds the transaction headers.
             *
             * @returns {String}
             */

            get_transaction_html_headers: function(){
                var html = "";

                html += '<tr id="bank-transaction-list-headers">';
                html += '<th>Date</th>';
                html += '<th>Type</th>';
                html += '<th>In</th>';
                html += '<th>Out</th>';
                html += '<th>Balance</th>';
                html += '</tr>';

                html += '<tr id="bank-transaction-list-headers-dotted"><td colspan="5"> </td></tr>';

                return html;
            },

            /**
             * Shows an error to the user.  This is generally used when they don't meet the requirements.
             *
             * @param {String} error The error message to show to the user.
             */

            bank_error: function(error){
                var elem = $("span#pd_money_bank_error");

                if(elem.html() != error){
                    elem.stop(true, false);
                    elem.html(error).fadeIn("slow").fadeTo(4000, 1).fadeOut("slow", function(){
                        elem.html("");
                    });
                }
            },

            /**
             * Deposits money into the bank account, and creates a new transaction.
             *
             * @param {Number} amount The ammount to be took out from the wallet and placed in the account.
             */

            deposit: function(amount){
                var user_id = yootil.user.id();

                amount = parseFloat(amount);

                money.data(user_id).decrease.money(amount);
                money.data(user_id).increase.bank(amount);

                $("#pd_money_wallet_amount").html(yootil.html_encode(money.data(user_id).get.money(true)));
                $("#pd_money_bank_balance").html(yootil.html_encode(money.data(user_id).get.bank(true)));

                this.create_transaction(1, amount, 0);
            },

            /**
             * Withdraws money from the bank account and creates a new transaction.
             *
             * @param {Number} amount The ammount to be placed into the wallet and removed from the bank account.
             */

            withdraw: function(amount){
                var user_id = yootil.user.id();

                amount = parseFloat(amount);

                money.data(user_id).decrease.bank(amount);
                money.data(user_id).increase.money(amount);

                $("#pd_money_wallet_amount").html(yootil.html_encode(money.data(user_id).get.money(true)));
                $("#pd_money_bank_balance").html(yootil.html_encode(money.data(user_id).get.bank(true)));

                this.create_transaction(2, 0, amount);
            },

            /**
             * Builds a fake account number for the user based on their user id.
             *
             * @returns {String} Padded string (i.e 0000001).
             */

            get_account_number: function(){
                var id = yootil.user.id();

                return yootil.pad(id, 11, "0");
            },

            /**
             * Builds a fake sort code for the user so they get that Bank feel ;) lol
             *
             * @returns {String}
             */

            get_sort_code: function(){
                var str = location.hostname.split(".");
                var sort_code = "";
                var total = 0;

                for(var a = 0, l = str[0].length; a < l; a ++){
                    total += str[0].charCodeAt(a);
                }

                total += str[0].length.toString();
                sort_code = yootil.pad(total, 6, "0");
                sort_code = sort_code.replace(/(\d)(?=(\d\d)+(?!\d))/g, "$1-");

                return sort_code;
            },

            /**
             * Gets the transactions for a user.  This is just a wrapper around the data object.
             *
             * @returns {Array}
             */

            get_transactions: function(user_id){
                return money.data(user_id).get.transactions();
            },

            /**
             * Creates a new transaction.
             *
             * @param {Number} type The type of transaction (i.e wages = 5).
             * @param {Number} in_amount The amount going in.
             * @param {Number} out_amount The amount going out.
             * @param {Boolean} skip_key_update If true, the key doesn't get saved (aka AJAX request).
             * @param {Number} force_previous_balance Uses this number as the previous balance amount in the account.
             * @param {Number} user_id The user id that will receive this transaction.
             * @returns {Array} If the type is a staff edit, then we return the new transaction list.
             */

            create_transaction: function(type, in_amount, out_amount, skip_key_update, force_previous_balance, user_id){
                var current_transactions = this.get_transactions(user_id);
                var now = (+ new Date());

                in_amount = parseFloat(in_amount);
                out_amount = parseFloat(out_amount);

                var total_balance = 0;
                var previous_balance = 0;

                if(typeof force_previous_balance == "number"){
                    previous_balance = force_previous_balance;
                } else if(current_transactions.length){
                    previous_balance = current_transactions[0][4];
                }

                total_balance = previous_balance;

                if(typeof force_previous_balance != "number"){
                    if(!previous_balance){
                        total_balance = parseFloat(money.data(user_id).get.bank());
                    } else if (typeof force_previous_balance == "string"){
                        // do nothing
                    } else {
                        total_balance += (type == 2)? - out_amount : in_amount;
                    }
                }

                total_balance = (Math.floor(100 * total_balance) / 100);

                current_transactions.unshift([type, in_amount, out_amount, now, total_balance]);

                this.add_new_transaction_row(type, in_amount, out_amount, now, total_balance);

                var new_transactions_list = current_transactions.slice(0, 50);

                if(type == 4){
                    return new_transactions_list;
                }

                money.data(user_id).set.transactions(new_transactions_list, skip_key_update);
            },

            /**
             * Creates the HTML for a new transaction row.
             *
             * @param {Number} type The type of transaction (i.e wages = 5).
             * @param {Number} in_amount The amount going in.
             * @param {Number} out_amount The amount going out.
             * @param {Number} now The date for this transaction.
             * @param {Number} balance The current balance.
             */

            add_new_transaction_row: function(type, in_amount, out_amount, now, balance){
                if($("#bank-transaction-list-headers").length == 0){
                    $("#bank-transaction-list").empty();
                    $("#bank-transaction-list").append(this.get_transaction_html_headers());
                }

                var trans_html = "";
                var date_str = this.format_transaction_date(now);
                var trans_type = "";

                switch(type){

                    // Deposit
                    case 1 :
                        trans_type = this.settings.text.types.DEPOSIT;
                        break;

                    // Withdraw
                    case 2 :
                        trans_type = this.settings.text.types.WITHDRAW;
                        break;

                    // Interest
                    case 3 :
                        trans_type = this.settings.text.types.INTEREST;
                        break;

                    // Staff edit
                    case 4 :
                        type = this.settings.text.types.STAFFEDIT;
                        break;

                    // Wages
                    case 5 :
                        type = this.settings.text.types.WAGES;
                        break;

                    // Rank Up
                    case 6 :
                        type = this.settings.text.types.RANKUP;
                        break;

                    case 7 :
                        type = this.settings.text.types.STAFFWAGES;
                        break;

                    case 8 :
                        type = this.settings.text.types.GIFTMONEY;
                        break;

                }

                if (type >= 9){
                    if (type % 5 == 0) {
                        trans_type = "RECEIVE FROM USER #" + (type - 5)/5;
                    } else if (type % 5 == 1){
                        trans_type = "DONATE TO USER #" + (type - 1 - 5)/5;
                    }
                }

                trans_html += '<tr class="bank-transaction-list-row">';
                trans_html += '<td>' + yootil.html_encode(date_str) + '</td>';
                trans_html += '<td>' + trans_type + '</td>';
                trans_html += '<td>' + yootil.html_encode(yootil.number_format(money.format(in_amount, true))) + '</td>';
                trans_html += '<td>' + yootil.html_encode(yootil.number_format(money.format(out_amount, true))) + '</td>';
                trans_html += '<td>' + yootil.html_encode(yootil.number_format(money.format(balance, true))) + '</td>';
                trans_html += '</tr>';

                $(trans_html).hide().insertAfter($("#bank-transaction-list-headers-dotted")).show("fast").fadeIn(3000).css("display", "");
            }

        };

    })().register();

    /**
     * @class monetary.Data
     * @constructor
     * Wrapper class around the users data that gets instantiated for each users data on the page.
     *
     *     var data = new monetary.Data(yootil.user.id())
     *
     * Note:  You need to create an instance for each user.  Monetary already does this for you. See the {@link monetary#data data method}.
     *
     * @param {Number} user_id
     * @param {Object} data This is the data that comes from the key for the user.
     */

    money.Data = (function(){

        function Data(user_id, data_obj){

            /**
             * @property {Number} user_id The user id for this user.
             */

            this.user_id = user_id;

            /**
             * @property {Object} data Data object for the user.
             * @property {Number} data.m General money (aka wallet).
             * @property {Number} data.b Bank money.
             * @property {Array} data.lt Last bank transactions.
             * @property {String} data.li Timestamp of last time interest was given.
             * @property {Object} data.s Stock market data.
             * @property {Object} data.w Wages.
             * @property {Number} data.w.p Total posts made (gets reset).
             * @property {Number} data.w.e Timestamp expiry.
             * @property {Number} data.w.w When the user is paid.
             * @property {Number} data.w.s Staff expiry timestamp.
             * @property {Array} data.g Gift codes.
             * @property {Number} data.or Old rank.
             * @property {Array} data.d Donations received.
             * @property {Number} data.ds Total amount for donations sent.
             * @property {Number} data.dr Total amount for donations received.
             * @property {Array} data.rd Rejected donations.
             */

            this.data = data_obj || {

                m: 0,

                b: 0,

                lt: [],

                li: "",

                s: {},

                w: {

                    p: 0,
                    e: 0,
                    w: 0,
                    s: 0

                },

                g: [],

                or: 0,

                d: [],

                ds: 0,

                dr: 0,

                rd: [],

                n: [], 
                
                p: 0,

            };

            /**
             * @property {String} error Holds the last error.  This isn't used much.
             */

            this.error = "";

            // Basic validation of data

            this.data.m = parseFloat(this.data.m);
            this.data.b = parseFloat(this.data.b);
            this.data.lt = (typeof this.data.lt == "object" && this.data.lt.constructor == Array)? this.data.lt : [];
            this.data.li = (typeof this.data.li == "string")? this.data.li : "";
            this.data.s = (typeof this.data.s == "object" && this.data.s.constructor == Object)? this.data.s : {};
            this.data.w = (typeof this.data.w == "object" && this.data.w.constructor == Object)? this.data.w : {};
            this.data.g = (typeof this.data.g == "object" && this.data.lt.constructor == Array)? this.data.g : [];
            this.data.or = (typeof this.data.or == "number")? this.data.or : 0;
            this.data.d = (typeof this.data.d == "object" && this.data.d.constructor == Array)? this.data.d : [];
            this.data.rd = (typeof this.data.rd == "object" && this.data.rd.constructor == Array)? this.data.rd : [];
            this.data.ds = (parseFloat(this.data.ds) > 0)? parseFloat(this.data.ds) : 0;
            this.data.dr = (parseFloat(this.data.dr) > 0)? parseFloat(this.data.dr) : 0;
            this.data.n = (typeof this.data.n == "object" && this.data.n.constructor == Array)? this.data.n : [];
            this.data.p = (typeof this.data.p == "number")? this.data.p : 0;

            /**
             * Updates the key data, however you can avoid an actual AJAX request if needed.  Usually this is called internally.
             *
             * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
             * @param {Object} callbacks Yootil key options that get passed on to the set method.
             * @param {Boolean} sync To sync up data across tabs / windows, pass true.
             */

            this.update = function(skip_update, callbacks, sync){
                if(!skip_update){

                    // Lets put in a length check on the data

                    if(!yootil.key.has_space(money.KEY)){
                        this.error = "Data length has gone over it's limit of " + yootil.forum.plugin_max_key_length();

                        pb.window.dialog("data_limit", {

                            title: "Key Data Limit Reached",
                            modal: true,
                            height: 200,
                            width: 350,
                            resizable: false,
                            draggable: false,
                            html: "Unfortunately we can not save anymore data in the key.<br /><br />Plugin: Monetary System",

                            buttons: {

                                Close: function () {
                                    $(this).dialog("close");
                                }

                            }

                        });

                        return;
                    }

                    yootil.key.set(money.KEY, this.data, this.user_id, callbacks);

                    if(sync){
                        money.sync.trigger();
                    }
                }
            };

            var self = this;

            this.fixed = function(val){
                return parseFloat(parseFloat(val).toFixed(2));
            };

            /**
             * @class monetary.Data.get
             * @static
             * Note:  You need to create an instance.  Monetary already does this for you. See the {@link monetary#data data method}.
             *
             *     var data = new monetary.Data(yootil.user.id());
             *
             *     data.get.money();
             *
             */

            this.get = {

                /**
                 * Gets the last error stored in the error property.
                 *
                 * @returns {String}
                 */

                error: function(){
                    return self.error;
                },

                /**
                 * Gets the internal data object for this user.
                 *
                 * @returns {Object}
                 */

                data: function(){
                    return self.data;
                },

                pushed: function(){
                    return self.pushed_data;
                },

                /**
                 * Gets the uses money from the data object.
                 *
                 *     monetary.data(yootil.user.id()).get.money();
                 *
                 * @param {Boolean} string Pass true to have a string returned back.
                 * @returns {Mixed}
                 */

                money: function(string){
                    var amount = money.format(self.data.m, string || false);

                    if(string){
                        amount = yootil.number_format(amount);
                    }

                    return amount;
                },

                /**
                 * Gets the uses bank money from the data object.
                 *
                 *     monetary.data(yootil.user.id()).get.bank();
                 *
                 * @param {Boolean} string Pass true to have a string returned back.
                 * @returns {Mixed}
                 */

                bank: function(string){
                    var amount = money.format(self.data.b, string || false);

                    if(string){
                        amount = yootil.number_format(amount);
                    }

                    return amount;
                },

                /**
                 * Gets the uses bank transactions from the data object.
                 *
                 * @returns {Array}
                 */

                transactions: function(){
                    return self.data.lt;
                },

                /**
                 * Gets the uses stock investments from the data object.
                 *
                 * @returns {Object}
                 */

                investments: function(){
                    return self.data.s;
                },

                /**
                 * Gets the last interest timestamp
                 *
                 * @returns {Mixed}
                 */

                interest: function(){
                    return self.data.li;
                },

                /**
                 * Gets the wages object from the data object.
                 *
                 * @returns {Object}
                 */

                wages: function(){
                    return self.data.w;
                },

                /**
                 * Gets the users gift codes they have accepted, these get deleted over time.
                 *
                 * @returns {Array}
                 */

                gifts: function(){
                    return self.data.g;
                },

                /**
                 * Gets the last rank recorded.
                 *
                 * @returns {Number}
                 */

                rank: function(){
                    return self.data.or;
                },

                /**
                 * Gets donations sent to this user.
                 *
                 * @returns {Number}
                 */

                donations: function(){
                    return self.data.d;
                },

                /**
                 * Gets the rejected donations for this user.
                 *
                 * @returns {Array}
                 */

                rejected_donations: function(){
                    return self.data.rd;
                },

                /**
                 * Gets the total value of donations sent to people.
                 *
                 * @param {Boolean} string Pass true to have a string returned back.
                 * @returns {Number}
                 */

                total_sent_donations: function(string){
                    var amount = money.format(self.data.ds, string || false);

                    if(string){
                        amount = yootil.number_format(amount);
                    }

                    return amount;
                },

                /**
                 * Gets the total value of donations received by people.
                 *
                 * @param {Boolean} string Pass true to have a string returned back.
                 * @returns {Mixed}
                 */

                total_received_donations: function(string){
                    var amount = money.format(self.data.dr, string || false);

                    if(string){
                        amount = yootil.number_format(amount);
                    }

                    return amount;
                },

                notifications: function(){
                    return self.data.n;
                }

            };

            /**
             * @class monetary.Data.decrease
             * @static
             * Note:  You need to create an instance.  Monetary already does this for you. See the {@link monetary#data data method}.
             *
             *     var data = new monetary.Data(yootil.user.id());
             *
             *     data.decrease.money();
             */

            this.decrease = {

                /**
                 * Decreases the uses money by the amount passed in.
                 *
                 *     monetary.data(yootil.user.id()).decrease.money(100);
                 *
                 * @param {Number} amount The amount to be deducted.
                 * @param {Boolean}	skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                money: function(amount, skip_update, opts, sync){
                    self.data.m = parseFloat(self.data.m) - parseFloat(amount);
                    self.data.m = self.fixed(self.data.m);
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Decreases the uses money in the bank by the amount passed in.
                 *
                 *     monetary.data(yootil.user.id()).decrease.bank(100);
                 *
                 * @param {Number} amount The amount to be deducted.
                 * @param {Boolean}	skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                bank: function(amount, skip_update, opts, sync){
                    self.data.b = parseFloat(self.data.b) - parseFloat(amount);
                    self.data.b = self.fixed(self.data.b);
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Decreases the total donations sent.
                 *
                 * Parameters:
                 * 	amount - *integer* The amount to be removed
                 * 	skip_update - *boolean* Pass true if you do not want to perform an actual AJAX update.
                 * 	options - *object* ProBoards key options that get passed on to the set method.
                 *	sync - *boolean* To sync up data across tabs / windows, pass true.
                 */

                donations_sent: function(amount, skip_update, opts, sync){
                    self.data.ds = parseFloat(self.data.ds) - parseFloat(amount);
                    self.data.ds = self.fixed(self.data.ds);
                    self.data.ds = (self.data.ds < 0)? 0 : self.data.ds;
                    self.update(skip_update, opts, sync);
                },

                /**
                 * 	Decreases the total donations received
                 *
                 * @param {Number} amount The amount to be deducted.
                 * @param {Boolean}	skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                donations_received: function(amount, skip_update, opts, sync){
                    self.data.dr = parseFloat(self.data.dr) - parseFloat(amount);
                    self.data.dr = self.fixed(self.data.dr);
                    self.data.dr = (self.data.dr < 0)? 0 : self.data.dr;
                    self.update(skip_update, opts, sync);
                }

            };

            /**
             * @class monetary.Data.increase
             * @static
             * Note:  You need to create an instance.  Monetary already does this for you. See the {@link monetary#data data method}.
             *
             *     var data = new monetary.Data(yootil.user.id());
             *
             *     data.increase.money();
             */

            this.increase = {

                /**
                 * Increases the uses money by the amount passed in.
                 *
                 *     monetary.data(yootil.user.id()).increase.money(100);
                 *
                 * @param {Number} amount The amount to be added.
                 * @param {Boolean}	skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                money: function(amount, skip_update, opts, sync){
                    self.data.m = parseFloat(self.data.m) + parseFloat(amount);
                    self.data.m = self.fixed(self.data.m);
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Increases the uses bank money by the amount passed in.
                 *
                 *     monetary.data(yootil.user.id()).increase.bank(100);
                 *
                 * @param {Number} amount The amount to be added.
                 * @param {Boolean}	skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                bank: function(amount, skip_update, opts, sync){
                    self.data.b = parseFloat(self.data.b) + parseFloat(amount);
                    self.data.b = self.fixed(self.data.b);
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Increases the total donations sent.
                 *
                 * @param {Number} amount The amount to be added.
                 * @param {Boolean}	skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                donations_sent: function(amount, skip_update, opts, sync){
                    self.data.ds = parseFloat(self.data.ds) + parseFloat(amount);
                    self.data.ds = self.fixed(self.data.ds);
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Increases the total donations received.
                 *
                 * @param {Number} amount The amount to be added.
                 * @param {Boolean}	skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                donations_received: function(amount, skip_update, opts, sync){
                    self.data.dr = parseFloat(self.data.dr) + parseFloat(amount);
                    self.data.dr = self.fixed(self.data.dr);
                    self.update(skip_update, opts, sync);
                },
                
                /**
                 * Sets the new total post count. Returns missing posts.
                 *
                 * @param {Boolean}	skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                post_count: function(skip_update, opts, sync){
                    var post_count = yootil.user.posts();
                    var prior_count = parseFloat(self.data.p);
                    var new_posts = 0
                    if (prior_count > 0 && post_count - prior_count > 1){
                        new_posts = post_count - prior_count - 1;
                    }
                    self.data.p = post_count;
                    self.data.p = self.fixed(self.data.p);
                    self.update(skip_update, opts, sync);
                    return new_posts;
                }

            };

            /**
             * @class monetary.Data.set
             * @static
             * Note:  You need to create an instance.  Monetary already does this for you. See the {@link monetary#data data method}.
             *
             *     var data = new monetary.Data(yootil.user.id());
             *
             *     data.set.money(1000);
             */

            this.set = {

                /**
                 * Sets the users money to the amount passed in
                 *
                 * @param {Number} amount The amount to set the money to.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                money: function(amount, skip_update, opts, sync){
                    self.data.m = parseFloat(amount);
                    self.data.m = self.fixed(self.data.m);
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Sets the users bank money to the amount passed in
                 *
                 * @param {Number} amount The amount to set the money to.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                bank: function(amount, skip_update, opts, sync){
                    self.data.b = parseFloat(amount);
                    self.data.b = self.fixed(self.data.b);
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Sets the users bank transactions
                 *
                 * @param {Number} amount The amount to set the money to.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                transactions: function(transactions, skip_update, opts, sync){
                    self.data.lt = transactions;
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Sets the users gifts
                 *
                 * @param {Number} amount The amount to set the money to.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                gifts: function(gifts, skip_update, opts, sync){
                    self.data.g = gifts;
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Sets the users rank
                 *
                 * @param {Number} amount The amount to set the money to.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                rank: function(rank, skip_update, opts, sync){
                    self.data.or = rank;
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Sets the users stock investments
                 *
                 * @param {Number} amount The amount to set the money to.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                investments: function(investments, skip_update, opts, sync){
                    self.data.s = investments;
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Sets the users last interest timestamp
                 *
                 * @param {Number} amount The amount to set the money to.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                interest: function(interest, skip_update, opts, sync){
                    self.data.li = interest;
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Sets the users wages
                 *
                 * @param {Number} amount The amount to set the money to.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                wages: function(wages, skip_update, opts, sync){
                    self.data.w = wages;
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Sets the users data
                 *
                 * @param {Number} amount The amount to set the money to.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                data: function(data, skip_update, opts, sync){
                    self.data = data;
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Sets the users data
                 *
                 * @param {Number} amount The amount to set the money to.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                donations: function(donations, skip_update, opts, sync){
                    self.data.d = donations;
                    self.update(skip_update, opts, sync);
                }

            };

            /**
             * @class monetary.Data.clear
             * @static
             * Note:  You need to create an instance.  Monetary already does this for you. See the {@link monetary#data data method}.
             *
             *     var data = new monetary.Data(yootil.user.id());
             *
             *     data.clear.money();
             */

            this.clear = {

                /**
                 * Clear the users gifts array
                 *
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                gifts: function(skip_update, opts, sync){
                    self.data.g = [];
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Clear the users investments object
                 *
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                investments: function(skip_update, opts, sync){
                    self.data.s = {};
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Clear the users wages object
                 *
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                wages: function(skip_update, opts, sync){
                    self.data.w = {};
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Clear the users bank amount
                 *
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                bank: function(skip_update, opts, sync){
                    self.data.b = 0;
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Clear the users money amount (aka wallet)
                 *
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                money: function(skip_update, opts, sync){
                    self.data.m = 0;
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Clear the users transactions array
                 *
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                transactions: function(skip_update, opts, sync){
                    self.data.lt = [];
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Clear the users last interest timestamp
                 *
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                interest: function(skip_update, opts, sync){
                    self.data.li = "";
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Clear the users old rank
                 *
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                rank: function(skip_update, opts, sync){
                    self.data.or = 0;
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Clear the users data object
                 *
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                data: function(skip_update, opts, sync){
                    self.data = {};
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Clear the users donations array
                 *
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                donations: function(skip_update, opts, sync){
                    self.data.d = [];
                    self.update(skip_update, opts, sync);
                },

                /**
                 * Clear the users rejected_donations array
                 *
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                rejected_donations: function(skip_update, opts, sync){
                    self.data.rd = [];
                    self.update(skip_update, opts, sync);
                },

                notifications: function(skip_update, opts, sync){
                    self.data.n = [];
                    self.update(skip_update, opts, sync);
                }

            };

            /**
             * @class monetary.Data.push
             * @static
             * Note:  You need to create an instance.  Monetary already does this for you. See the {@link monetary#data data method}.
             *
             *     var data = new monetary.Data(yootil.user.id());
             *
             *     data.push.gift("abc")
             */

            this.push = {

                /**
                 * Pushes a gift code to the data object when it's been accepted.
                 *
                 * @param {String} code The code to be pushed to the array.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                gift: function(code, skip_update, opts, sync){
                    self.data.g.push(code);
                    self.update(skip_update, opts, sync);
                },

                // a 3rd element: 1 = set, 2 = reset, 3 = increase, 4 = descrease

                // type: 1 = money, 2 = bank

                notification: function(notification, skip_update, opts, sync){
                    notification.amount = [parseFloat(notification.amount[0]), parseFloat(notification.amount[1]), notification.amount[2]];

                    self.data.n.push({

                        k: notification.type,
                        a: notification.amount,
                        t: notification.time,
                        u: notification.user

                    });

                    self.update(skip_update, opts, sync);
                }

            };

            /**
             * @class monetary.Data.donation
             * @static
             * Note:  You need to create an instance.  Monetary already does this for you. See the {@link monetary#data data method}.
             *
             *     var don = ...
             *     var data = new monetary.Data(yootil.user.id());
             *
             *     data.donation.send(don, false, null, null)
             */

            this.donation = {

                /**
                 * Easily send a user a donation
                 *
                 *     don = {
                 * 	   	to: (Data object),
                 *     	amount: (Number),
                 *     	message: {
                 *     		text: (String),
                 *     		len: (Number)
                 *     	},
                 *     	from: {
                 *     		id: (Number),
                 *     		name: (String)
                 *     	}
                 *     }
                 *
                 *     monetary.data(yootil.user.id()).donation.send(don, false, null, null);
                 *
                 * @param {Object} don The donation object must be specific to the example below
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                send: function(don, skip_update, opts, sync){
                    if(don){
                        if(don.to && don.amount && parseFloat(don.amount) > 0 && don.from && don.from.id && parseInt(don.from.id) > 0 && don.from.name && don.from.name.length){
                            var the_donation = {

                                t: (+ new Date()),
                                a: parseFloat(don.amount),
                                f: [don.from.id, don.from.name]

                            };

                            if(don.message && don.message.text && don.message.text.length){
                                the_donation.m = don.message.text.substr(0, ((don.message.len)? don.message.len : 50)).replace(/\n|\r/g, "[br]");
                            }

                            // Push donation to the array (note:  this is on the receivers object)

                            don.to.donation.push(the_donation);
                            don.to.update(skip_update);


                            self.increase.donations_sent(don.amount, true, null, false);

                            money.bank.create_transaction(parseInt(don.to.user_id)*5 + 6, 0, don.amount, false, "donation");

                            // Remove donation amount
                            self.decrease.money(don.amount, skip_update, opts, sync);

                            return true;
                        }
                    }

                    return false;
                },

                /**
                 * Easily send a user a donation
                 *
                 *     reject_donation = {
                 *     	amount: donation.a,
                 *     	receiver: [yootil.user.id(), yootil.user.name()],
                 *     	from: donation.f[0],
                 *     	time: donation.t
                 *     }
                 *
                 *     monetary.data(yootil.user.id()).donation.send_rejected(reject_donation, false, null, null);
                 *
                 * @param {Object} don The donation object must be specific to the example below
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                send_rejected: function(don, skip_update, opts, sync){
                    if(don.amount && don.receiver && don.from && don.time){
                        var reject = {

                            a: don.amount,
                            r: don.receiver,
                            t: don.time

                        };

                        // Push rejected donation to the array (note:  this is on the senders object)

                        money.data(don.from).donation.push_reject(reject);
                        money.data(don.from).update(skip_update);
                        self.update(skip_update, opts, sync);
                    }
                },

                /**
                 * Checks to see if a donation exists.
                 *
                 * @param {String} id The id is the donation timestamp and the user id joined by string
                 * @param {Boolean} return_donation Pass true to return the donation object.
                 * @returns {Mixed} Either the object, or an index is returned.  -1 is returned if not found.
                 */

                exists: function(id, return_donation){
                    if(id){
                        for(var d = 0, l = self.data.d.length; d < l; d ++){
                            var donation_id = self.data.d[d].t + "" + self.data.d[d].f[0];

                            if(donation_id == id){
                                return (return_donation)? self.data.d[d] : d;
                            }
                        }
                    }

                    return -1;
                },

                /**
                 * Checks to see if a rejected donation exists.
                 *
                 * @param {String} id The id is the donation timestamp and the user id joined by string
                 * @param {Boolean} return_donation Pass true to return the donation object.
                 * @returns {Mixed} Either the object, or an index is returned.  -1 is returned if not found.
                 */

                reject_exists: function(id, return_donation){
                    if(id){
                        for(var d = 0, l = self.data.rd.length; d < l; d ++){
                            var donation_id = self.data.rd[d].t + "" + self.data.rd[d].r[0];

                            if(donation_id == id){
                                return (return_donation)? self.data.rd[d] : d;
                            }
                        }
                    }

                    return -1;
                },

                /**
                 * Accepts a donation and handles increasing the users money.
                 *
                 * @param {Object} donation The donation object.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                accept: function(donation, skip_update, opts, sync){
                    var index = self.donation.exists(donation.t + "" + donation.f[0]);

                    if(index > -1){
                        self.data.d.splice(index, 1);
                        self.increase.donations_received(donation.a, true, null, false);
                        transactions = money.bank.create_transaction(5*parseInt(donation.f[0]) + 5, donation.a, 0, false, "donation");
                        self.increase.money(donation.a, skip_update, opts, sync);

                    }
                },

                /**
                 * Rejects a donation and handles sending the rejected donation to the sender.
                 *
                 * @param {Object} donation The donation object.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 */

                reject: function(donation, skip_update, opts, sync){
                    var index = self.donation.exists(donation.time + "" + donation.from);

                    if(index > -1){
                        self.data.d.splice(index, 1);
                        self.donation.send_rejected(donation, skip_update, opts, sync);
                    }
                },

                /**
                 * Accepts the rejected donation and handles increasing the users money.
                 *
                 * @param {Object} donation The donation object.
                 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
                 * @param {Object} options Yootil key options that get passed on to the set method.
                 * @param {Boolean} sync To sync up data across tabs / windows, pass true.
                 *
                 * Returns:
                 * 	*boolean*
                 */

                accept_reject: function(donation, skip_update, opts, sync){
                    var index = self.donation.reject_exists(donation.t + "" + donation.r[0]);

                    if(index> -1){
                        self.data.rd.splice(index, 1);
                        self.decrease.donations_sent(donation.a, true, null, false);
                        transactions = money.bank.create_transaction(5*parseInt(donation.r[0]) + 5, donation.a, 0, false, "donation");
                        self.increase.money(donation.a, skip_update, opts, sync);

                        return true;
                    }

                    return false;
                },

                /**
                 * Pushes a donation to the array.
                 *
                 * @param {Object} donation The donation object
                 */

                push: function(donation){
                    self.data.d.push(donation);
                },

                /**
                 * Pushes a rejected donation to the array.
                 *
                 * @param {Object} reject The donation object
                 */

                push_reject: function(reject){
                    self.data.rd.push(reject);
                }

            };

            return this;
        }

        return Data;

    })();

    /**
     * @class monetary.donation
     * @static
     *
     *     Allows members to donate money to each other.
     */

    money.donation = (function(){

        return {

            /**
             * @property {Object} settings Default settings which can be overwritten from setup.
             * @property {Boolean} settings.enabled Module enabled or not.
             * @property {Boolean} settings.show_profile_button If true, the donation button will show on members profile.
             * @property {Number} settings.minimum_donation The minimum amount that a donation can be.
             * @property {Number} settings.maximum_donation The maximum amount that a donation can be.
             * @property {Boolean} settings.page_timer_enabled If true, then pages can expire if the user takes too long.
             * @property {Number} settings.message_max_len The maximum length a message can be.
             * @property {Boolean} settings.show_total_sent_mini_profile If true, the total of all donations sent will show in the mini profile.
             * @property {Boolean} settings.show_total_received_mini_profile If true, the total of all donations received will show in the mini profile.
             * @property {Boolean} settings.show_total_sent_profile If true, the total of all donations sent will show on the profile.
             * @property {Boolean} settings.show_total_received_profile If true, the total of all donations received will show on the profile.
             * @property {String} settings.donation_image The image that will be used in the Yootil bar.
             * @property {Object} text Text replacements.
             * @property {String} text.donation
             * @property {String} text.donations
             * @property {Array} excluded Members who are excluded from using the donation system.
             */

            settings: {

                enabled: true,
                show_profile_button: true,

                minimum_donation: 0.01,
                maximum_donation: 0,

                page_timer_enabled: true,

                message_max_len: 50,

                show_total_sent_mini_profile: false,
                show_total_received_mini_profile: false,
                show_total_sent_profile: false,
                show_total_received_profile: false,

                donation_image: null,

                text: {

                    donation: "Donation",
                    donations: "Donations"

                },

                excluded: []

            },

            /**
             * @property {Number} page_timer The current time spent on the page when using the donation feature.
             */

            page_timer: 0,

            /**
             * @property {Number} PAGE_TIME_EXPIRY The time until the donation feature expires.
             */

            PAGE_TIME_EXPIRY: 45,

            /**
             * @property {Number} interval The set interval id.
             */

            interval: 0,

            /**
             * @property {Object} donation_to Holds tmp data for the user the donation is to.
             * @property {String} donation_to.name
             * @property {String} donation_to.url
             * @property {String} donation_to.avatar
             */

            donation_to: {

                name: "",
                url: "",
                avatar: ""

            },

            /**
             * @property {Object} donation_from Holds tmp data for the user the donation is from.
             * @property {String} donation_from.name
             * @property {String} donation_from.url
             * @property {String} donation_from.avatar
             */

            donation_from: {

                name: "",
                url: "",
                avatar: ""

            },

            /**
             * This is called from the main class.  Each module gets registered and a loop goes through and calls this.
             */

            init: function(){
                this.setup();

                if(yootil.user.logged_in()){
                    if(!this.settings.enabled){
                        money.show_default();
                        return;
                    }

                    var self = this;
                    var total_donations = self.get_total_donations();

                    if(/*total_donations &&*/ this.can_send_receive()){
                        yootil.bar.add("/user/" + yootil.user.id() + "?monetarydonation&view=2", this.settings.donation_image, this.settings.text.donations, "pdmsdonate");

                        /*$("#yootil-bar").ready(function(){
                            var bar_link = $("#yootil-bar a[href*=monetarydonation\\&view\\=2]");

                            var tip = '<div class="monetary-donation-tip-holder"><div class="monetary-donation-tip-number">' + total_donations + '</div><span class="monetary-donation-tip"></span></div>';

                            bar_link.append($(tip));
                        });*/
                    }

                    this.check_rejected_donations();

                    if(yootil.location.profile_home()){
                        if(location.href.match(/\?monetarydonation&view=(\d+)/i) && RegExp.$1 && parseInt(RegExp.$1) >= 1 && parseInt(RegExp.$1) <= 3){
                            var id = ~~ yootil.page.member.id();
                            var view = ~~ RegExp.$1;

                            switch(view){

                                // Sending

                                case 1:
                                    if(yootil.page.member.id() != yootil.user.id()){
                                        yootil.create.page(new RegExp("\\/user\\/" + id + "\\?monetarydonation&view=1"), "Send " + this.settings.text.donation);
                                        $("#content").empty();
                                        yootil.create.nav_branch("/user/" + id + "?monetarydonation&view=1", "Send " + this.settings.text.donation);

                                        if(this.can_send_receive()){
                                            this.collect_donation_to_details();
                                            this.build_send_donation_html();

                                            if(this.settings.page_timer_enabled){
                                                this.monitor_time_on_page();
                                            }
                                        } else {
                                            this.show_error("You do not have permission to send " + this.settings.text.donations.toLowerCase() + ".");
                                        }
                                    } else {
                                        money.show_default();
                                    }

                                    break;

                                // View received donation list

                                case 2:
                                    yootil.create.page(new RegExp("\\/user\\/" + yootil.user.id() + "\\?monetarydonation&view=2"), "Received " + this.settings.text.donations);
                                    $("#content").empty();
                                    yootil.create.nav_branch("/user/" + yootil.user.id() + "?monetarydonation&view=2", "Received " + this.settings.text.donations);

                                    if(this.can_send_receive()){
                                        this.build_received_donations_html();
                                    } else {
                                        this.show_error("You do not have permission to view this page.");
                                    }

                                    break;

                                // Viewing a donation
                                // All donations have to be accepted

                                case 3:
                                    var don_id = (location.href.match(/view=3&id=([\d\.]+)/))? RegExp.$1 : -1;

                                    if(don_id){
                                        yootil.create.page(new RegExp("\\/user\\/" + id + "\\?monetarydonation&view=3&id=[\\d\\.]+"), "Viewing " + this.settings.text.donation);
                                        $("#content").empty();

                                        if(this.can_send_receive()){
                                            this.build_view_donation_html(don_id);
                                        } else {
                                            this.show_error("You do not have permission to receive " + this.settings.text.donations.toLowerCase() + ".");
                                        }
                                    } else {
                                        money.show_default();
                                    }

                                    break;

                            }
                        } else if(yootil.page.member.id() != yootil.user.id() && this.settings.show_profile_button){
                            if(this.can_send_receive()){
                                this.create_donation_button();
                            }
                        }
                    }
                }
            },

            /**
             * Gets the users total donations.
             *
             * @returns {Number}
             */

            get_total_donations: function(){
                var donations = money.data(yootil.user.id()).get.donations();

                return donations.length;
            },

            /**
             * Checks to see if there have been any rejected donations, if so, displays a mesage to the user.
             */

            check_rejected_donations: function(){
                var rejected = money.data(yootil.user.id()).get.rejected_donations();

                if(rejected.length){
                    var reject = rejected[0];
                    var donation_id = reject.t + "" + reject.r[0];
                    var content = "Your " + this.settings.text.donation.toLowerCase() + " of " + money.settings.money_symbol + money.format(reject.a, true) + " to <a href='/user/" + yootil.html_encode(reject.r[0]) + "'>" + yootil.html_encode(reject.r[1], true) + "</a> was rejected.";

                    pb.window.dialog("montary-donation-reject", {
                        modal: true,
                        height: 160,
                        resizable: false,
                        draggable: false,
                        title: (this.settings.text.donation + " Rejected"),
                        html: content,
                        buttons: {
                            "Place In Wallet": function(){
                                var ok = money.data(yootil.user.id()).donation.accept_reject(reject);

                                // Lets look for any wallets or amounts on the page and update

                                if(ok){
                                    var user_money = money.data(yootil.user.id()).get.money(true);
                                    var user_money_display = $(".pd_money_amount_" + yootil.user.id());

                                    if(user_money_display.length){
                                        user_money_display.text(user_money);
                                    }

                                    // Now wallet

                                    var wallet = $("#pd_money_wallet_amount");

                                    if(wallet.length){
                                        wallet.text(user_money);
                                    }

                                    var other_wallet = $(".money_wallet_amount");

                                    if(other_wallet.length){
                                        other_wallet.html(money.settings.text.wallet + money.settings.money_separator + money.settings.money_symbol + yootil.html_encode(user_money));
                                    }

                                    // Donation sent

                                    var user_donations_sent = money.data(yootil.user.id()).get.total_sent_donations(true);
                                    var user_donations_sent_display = $(".pd_donations_sent_amount_" + yootil.user.id());

                                    if(user_donations_sent_display.length){
                                        user_donations_sent_display.text(user_donations_sent);
                                    }
                                }

                                $(this).dialog("close");
                            }
                        }
                    });
                }
            },

            /**
             * Handles timing out the donation feature to prevent stale data.
             */

            monitor_time_on_page: function(){
                var self = this;

                this.interval = setInterval(function(){
                    if(self.page_timer >= self.PAGE_TIME_EXPIRY){
                        $(".monetary-donation-form").css("opacity", .3);
                        $(".monetary-donation-fields input").attr("disabled", true);
                        $(".monetary-donation-fields textarea").attr("disabled", true);
                        $("dd.monetary-donation-button button").css("visibility", "hidden");

                        $("#monetary-donation-page-expiry").html("Page Expires In: expired");

                        pb.window.alert("Page Expired", "This page has expired, please refresh.", {
                            modal: true,
                            height: 160,
                            resizable: false,
                            draggable: false
                        });

                        clearInterval(self.interval);

                        return;
                    }

                    self.page_timer ++;

                    var time_left = self.PAGE_TIME_EXPIRY - self.page_timer;

                    time_left = (time_left < 0)? 0 : time_left;

                    $("#monetary-donation-page-expiry").html("Page Expires In: " + time_left + " second" + ((time_left == 1)? "" : "s"));
                }, 1000);
            },

            /**
             * Cancels the page expiration when donation has been sent.
             */

            cancel_expiration: function(){
                $(".monetary-donation-sending-to-title").html(this.settings.text.donation + " Sent");
                clearInterval(this.interval);
            },

            /**
             * Collects the users details who will be receiving the donation and stores them for later use.
             *
             * @param {Boolean} from If true, we store in the donation_from object, otherwise in the donation_to object.
             */

            collect_donation_to_details: function(from){
                var member_avatar = $(".avatar-wrapper:first img:first").attr("src");
                var member_name = yootil.page.member.name();
                var member_url = yootil.page.member.url();
                var member_id = yootil.page.member.id();
                var member_money = money.data(member_id).get.money(true);
                var key = (from)? "donation_from" : "donation_to";

                this[key] = {

                    name: member_name,
                    url: member_url,
                    avatar: member_avatar,
                    user_id: member_id,
                    money: member_money

                };
            },

            /**
             *  Collects the users details who is sending the donation and stores them for later use.
             */

            collect_donation_from_details: function(){
                this.collect_donation_to_details(true);
            },

            /**
             * Shows an error to the user.
             *
             * @param {String} msg The message the user will see.
             */

            show_error: function(msg){
                var html = "";

                html += "<div class='monetary-donation-notice-icon'><img src='" + money.images.info + "' /></div>";
                html += "<div class='monetary-donation-notice-content'>" + msg + "</div>";

                var container = yootil.create.container("An Error Has Occurred", html).show();

                container.appendTo("#content");
            },

            /**
             * Handles overwriting default values.  These come from the plugin settings.
             */

            setup: function(){
                if(money.plugin){
                    var settings = money.plugin.settings;

                    this.settings.enabled = (!! ~~ settings.donations_enabled)? true : false;
                    this.settings.show_profile_button = (!! ~~ settings.show_profile_button)? true : false;
                    this.settings.minimum_donation = parseFloat(settings.minimum_donation);
                    this.settings.maximum_donation = parseFloat(settings.maximum_donation);

                    if(this.settings.minimum_donation < 1){
                        if(!money.settings.decimal_money){
                            this.settings.minimum_donation = 1;
                        } else if(this.settings.minimum_donation <= 0){
                            this.settings.minimum_donation = 0.01;
                        }
                    }

                    this.settings.text.donation = (settings.donation_text && settings.donation_text.length)? settings.donation_text : this.settings.text.donation;
                    this.settings.text.donations = this.settings.text.donation;

                    if(!this.settings.text.donations.match(/s$/)){
                        this.settings.text.donations += "s";
                    }

                    this.settings.show_total_sent_mini_profile = (!! ~~ settings.donations_sent_mp)? true : false;
                    this.settings.show_total_received_mini_profile = (!! ~~ settings.donations_received_mp)? true : false;
                    this.settings.show_total_sent_profile = (!! ~~ settings.donations_sent_profile)? true : false;
                    this.settings.show_total_received_profile = (!! ~~ settings.donations_received_profile)? true : false;

                    this.settings.excluded = (settings.exc_don_grps && settings.exc_don_grps.length)? settings.exc_don_grps : this.settings.excluded;

                    this.settings.donation_image = (settings.don_img && settings.don_img.length)? settings.don_img : money.images.donate;
                }
            },

            /**
             * Checks to see if the user is excluded or not.
             *
             * @returns {Boolean}
             */

            can_send_receive: function(){
                if(this.settings.excluded && this.settings.excluded.length){
                    var grps = yootil.user.group_ids();

                    for(var g = 0; g < grps.length; g ++){
                        if($.inArrayLoose(grps[g], this.settings.excluded) > -1){
                            return false;
                        }
                    }
                }

                return true;
            },

            /**
             * Registers this module to the money class.
             * @returns {Object}
             */

            register: function(){
                money.modules.push(this);
                return this;
            },

            /**
             * Creates the donation button on user profiles.
             */

            create_donation_button: function(){

                // Let's see if the send message button exists, if so, clone it, and insert
                // donation button

                var send_button = $(".controls a.button[href^='/conversation/new/']");

                if(send_button.length){
                    var clone = send_button.clone();
                    var id = ~~ yootil.page.member.id();

                    clone.attr("href", "/user/" + id + "?monetarydonation&view=1").text("Send " + this.settings.text.donation);
                    clone.insertAfter(send_button);
                }
            },

            /**
             * Builds the page that is used for sending donations.
             */

            build_send_donation_html: function(){
                var html = "";

                var title = "<div class='monetary-donation'>";

                var donation_to_user = "<a href='" + yootil.html_encode(this.donation_to.url) + "'>" + yootil.html_encode(this.donation_to.name, true) + "</a>";

                title += "<div class='monetary-donation-sending-to-title'>Sending " + this.settings.text.donation + " - <span id='monetary-donation-page-expiry'>Page Expires In: " + this.PAGE_TIME_EXPIRY + " seconds</span></div>";
                title += "<div class='monetary-donation-sending-amount-title' id='pd_money_wallet'>" + money.settings.text.wallet + ': ' + money.settings.money_symbol + "<span id='pd_money_wallet_amount'>" + yootil.html_encode(money.data(yootil.user.id()).get.money(true)) + "</span></div>";

                html += "<div class='monetary-donation-form'>";
                html += "<div class='monetary-donation-avatar-img'><img title='" + yootil.html_encode(this.donation_to.name, true) + "' src='" + yootil.html_encode(this.donation_to.avatar) + "'><p class='monetary-donation-to-current-amount'>" + money.settings.money_symbol + yootil.html_encode(this.donation_to.money) + "</p></div>";
                html += "<div class='monetary-donation-fields'>";

                html += "<dl>";

                html += "<dt><strong>" + this.settings.text.donation + " To:</strong></dt>";
                html += "<dd>" + donation_to_user + "</dd>";

                html += "<dt><strong>" + this.settings.text.donation + " Amount:</strong></dt>";
                html += "<dd><input id='pd_donation_amount' type='text' value='0.00' /><span id='pd_donation_amount_error'></span></dd>";

                html += "<dt><strong>Message:</strong></dt>";
                html += "<dd><textarea name='pd_donation_message' id='pd_donation_message'></textarea>";
                html += "<span style='display: none' class='monetary-donation-message-chars-remain'>Characters Remaining: <span id='monatary-donation-chars-remain'>" + this.settings.message_max_len + "</span></dd>";

                html += "<dt class='monetary-donation-button'> </dt>";
                html += "<dd class='monetary-donation-button'><button>Send " + this.settings.text.donation + "</button></dd>";

                html += "</dl>";

                html += "</div><br style='clear: both' />";
                html += "</div>";

                var container = yootil.create.container(title + "<br style='clear: both;' />", html).show();

                var self = this;

                container.find("input#pd_donation_amount").focus(function(){
                    $(this).val("");
                });

                container.find("input#pd_donation_amount").blur(function(){
                    if(!$(this).val().length){
                        $(this).val(money.format(0, true));
                    }
                });

                container.find(".monetary-donation-message-chars-remain").show();
                container.find(".monetary-donation-button button").click($.proxy(this.send_donation_handler, this));
                container.appendTo("#content");

                var msg_len_handler = function(){
                    var len = this.value.length;
                    var remain = (self.settings.message_max_len - this.value.length);

                    remain = (remain < 0)? 0 : remain;
                    $("#monatary-donation-chars-remain").html(remain);
                };

                $("#pd_donation_message").bind("keyup keydown",  msg_len_handler);
            },

            /**
             * Builds the page for receiving donations.
             */

            build_received_donations_html: function(){
                var donations = money.data(yootil.user.id()).get.donations();
                var html = "";

                html = "<table class='monetary-donation-received-list list'>";
                html += "<thead><tr class='head'>";
                html += "<th class='monetary-donation-icon'> </th>";
                html += "<th class='main monetary-donation-amount'>" + this.settings.text.donation + " Amount</th>";
                html += "<th class='monetary-donation-from'>" + this.settings.text.donation + " From</th>";
                html += "<th class='monetary-donation-date'>Date Sent</th>";
                html += "<th></th></tr></thead>";
                html += "<tbody class='list-content'>";

                var counter = 0;
                var time_24 = (yootil.user.time_format() == "12hr")? false : true;

                if(donations.length){
                    for(var d = 0, l = donations.length; d < l; d ++){
                        var amount = money.format(donations[d].a, true);
                        var date = money.correct_date(donations[d].t);
                        var day = date.getDate() || 1;
                        var month = money.months[date.getMonth()];
                        var year = date.getFullYear();
                        var hours = date.getHours();
                        var mins = date.getMinutes();
                        var date_str = money.days[date.getDay()] + " " + day + "<sup>" + money.get_suffix(day) + "</sup> of " + month + ", " + year + " at ";
                        var am_pm = "";

                        mins = (mins < 10)? "0" + mins : mins;

                        if(!time_24){
                            am_pm = (hours > 11)? "pm" : "am";
                            hours = hours % 12;
                            hours = (hours)? hours : 12;
                        }

                        date_str += hours + ":" + mins + am_pm;

                        klass = (counter == 0)? " first" : ((counter == (l - 1))? " last" : "");

                        html += "<tr class='item conversation" + klass + "' data-donation-from='" + yootil.html_encode(donations[d].f[0]) + "'>";
                        html += "<td><img src='" + money.images.donate_big + "' alt='" + this.settings.text.donation + "' title='" + this.settings.text.donations + "' /></td>";
                        html += "<td>" + money.settings.money_symbol + yootil.html_encode(amount) + "</td>";
                        html += "<td><a href='/user/" + yootil.html_encode(donations[d].f[0]) + "'>" + yootil.html_encode(donations[d].f[1], true) + "</a></td>";
                        html += "<td>" + date_str + "</td>";
                        html += "<td class='monetary-donation-button'><button data-donation-id='" + yootil.html_encode(donations[d].t) + "" + yootil.html_encode(donations[d].f[0]) + "'>View " + this.settings.text.donation + "</button></td>";
                        html += "</tr>";

                        counter ++;
                    }
                } else {
                    html += "<tr class='item conversation last'><td colspan='5'><em>You have not received any " + this.settings.text.donations.toLowerCase() + ".</em></td></tr>";
                }

                html += "</tbody></table>";

                var container = yootil.create.container("Donations Received (" + donations.length + ")", html).show();

                container.find("tr.item").mouseenter(function(){
                    $(this).addClass("state-hover");
                }).mouseleave(function(){
                    $(this).removeClass("state-hover");
                });

                container.find("div.pad-all").removeClass("pad-all").addClass("cap-bottom");
                container.find(".monetary-donation-button button").click(function(){
                    var id = $(this).attr("data-donation-id");
                    var from = ~~ $(this).parent().parent().attr("data-donation-from");

                    location.href = "/user/" + from + "?monetarydonation&view=3&id=" + id;
                });

                container.appendTo("#content");
            },

            /**
             * Donations can include a message, here we parse it.
             *
             * @param {String} msg
             * @return {String}
             */

            parse_donation_message: function(msg){
                if(msg && msg.length){
                    msg = yootil.html_encode(msg);

                    return msg.replace(/\[br\]/g, "<br />");
                }

                return "";
            },

            /**
             * Fetches a donation for the user.
             *
             * @param {Number} id The donation id.
             * @return {Object} The donation from the users data object.
             */

            fetch_donation: function(id){
                var donations = money.data(yootil.user.id()).get.donations();

                for(var d = 0, l = donations.length; d < l; d ++){
                    var don_id = donations[d].t + "" + donations[d].f[0];

                    if(don_id == id){
                        return donations[d];
                    }
                }

                return null;
            },

            /**
             * Builds the page to view a donation.
             */

            build_view_donation_html: function(donation_id){
                var the_donation = this.fetch_donation(donation_id);
                var member_id = (yootil.page.member.id())? yootil.page.member.id() : location.href.match(/\/user\/(\d+)/i)[1];

                if(the_donation && member_id == the_donation.f[0]){
                    the_donation.id = donation_id;

                    yootil.create.nav_branch("/user/" + yootil.html_encode(the_donation.f[0]) + "?monetarydonation&view=3&id=" + yootil.html_encode(donation_id), "Viewing " + this.settings.text.donation);

                    this.collect_donation_from_details();

                    var donation_from_user = "<a href='" + yootil.html_encode(this.donation_from.url) + "'>" + yootil.html_encode(this.donation_from.name, true) + "</a>";

                    var html = "";

                    html += "<div class='monetary-donation-form'>";
                    html += "<div class='monetary-donation-avatar-img'><img title='" + yootil.html_encode(this.donation_from.name, true) + "' src='" + yootil.html_encode(this.donation_from.avatar) + "'><p class='monetary-donation-to-current-amount'>" + money.settings.money_symbol + yootil.html_encode(this.donation_from.money) + "</p></div>";
                    html += "<div class='monetary-donation-fields'>";

                    html += "<dl>";

                    html += "<dt><strong>" + this.settings.text.donation + " From:</strong></dt>";
                    html += "<dd>" + donation_from_user + "</dd>";

                    html += "<dt><strong>" + this.settings.text.donation + " Amount:</strong></dt>";
                    html += "<dd>" + money.settings.money_symbol + yootil.html_encode(money.format(the_donation.a, true)) + "</dd>";

                    html += "<dt><strong>Message:</strong></dt>";
                    html += "<dd style='float: left'>" + this.parse_donation_message(the_donation.m) + "</dd>";

                    html += "<dt style='clear: both'> </dt>";
                    html += "<dd style='clear: both'> </dd>";

                    html += "<dt class='monetary-donation-button'> </dt>";
                    html += "<dd class='monetary-donation-button'><button id='monetary-donation-accept'>Accept " + this.settings.text.donation + "</button> <button id='monetary-donation-reject'>Reject " + this.settings.text.donation + "</button></dd>";

                    html += "</dl>";

                    html += "</div><br style='clear: both' />";
                    html += "</div>";

                    var title = "<div class='monetary-donation-viewing-title'>Viewing Donation - <span id='monetary-donation-page-expiry'>Page Expires In: " + this.PAGE_TIME_EXPIRY + " seconds</span></div>";
                    title += "<div class='monetary-donation-receiving-amount-title' id='pd_money_wallet'>" + money.settings.text.wallet + ': ' + money.settings.money_symbol + "<span id='pd_money_wallet_amount'>" + yootil.html_encode(money.data(yootil.user.id()).get.money(true)) + "</span></div>";

                    var container = yootil.create.container(title + "<br style='clear: both;' />", html).show();

                    container.appendTo("#content");

                    container.find("button#monetary-donation-accept").click($.proxy(this.accept_donation, this, the_donation));
                    container.find("button#monetary-donation-reject").click($.proxy(this.reject_donation, this, the_donation));

                    if(this.settings.page_timer_enabled){
                        this.monitor_time_on_page();
                    }
                } else {
                    this.show_error(this.settings.text.donation + " could not be found.<br /><br />If you continue to experience this error, please contact a member of staff.");
                }
            },

            /**
             * Accepts donation and creates a notification for the person who sent it.
             *
             * @param {Object} donation The donation to be accepted.
             */

            accept_donation: function(donation){
                monetary.create_notification("[DA:" + donation.a + "|" + yootil.user.id() + "|" + yootil.user.name() + "]", donation.f[0]);

                money.data(yootil.user.id()).donation.accept(donation, false, {
                    complete: function(){
                        location.href = "/user/" + yootil.user.id() + "?monetarydonation&view=2";
                        money.sync.trigger();
                    }
                });
            },

            /**
             * Rejects a donation.  The user who sent the donation gets a notification of rejected donations.
             *
             * @param {Object} donation The donation to be rejected.
             */

            reject_donation: function(donation){
                var reject_donation = {
                    amount: donation.a,
                    receiver: [yootil.user.id(), yootil.user.name()],
                    from: donation.f[0],
                    time: donation.t
                };

                //monetary.create_notification("[DR:" + yootil.user.id() + "|" + yootil.user.name() + "]", reject_donation.from);

                money.data(yootil.user.id()).donation.reject(reject_donation, false, {
                    complete: function(){
                        location.href = "/user/" + yootil.user.id() + "?monetarydonation&view=2";
                        money.sync.trigger();
                    }
                });
            },

            /**
             * The handler for sending donations.  This does the validation and builds the donation object to be sent.
             */

            send_donation_handler: function(){
                var donation_amount = $("input#pd_donation_amount").val();
                var message = $("textarea#pd_donation_message").val();
                var current_amount = money.data(yootil.user.id()).get.money();

                if(!donation_amount.match(/^\d+(\.\d{1,2})?$/)){
                    this.donation_error(this.settings.text.donation + " amount must be a number.");
                } else if(parseFloat(donation_amount) > current_amount){
                    this.donation_error("Not enough money to cover " + this.settings.text.donation.toLowerCase() + ".");
                } else {
                    if(parseFloat(donation_amount) < this.settings.minimum_donation){
                        this.donation_error("Minimum " + this.settings.text.donation.toLowerCase() + " amount is " + money.format(this.settings.minimum_donation, true) + ".");
                    } else {
                        if(this.settings.maximum_donation && parseFloat(donation_amount) > this.settings.maximum_donation){
                            this.donation_error("Maximum " + this.settings.text.donation.toLowerCase() + " amount is " + money.format(this.settings.maximum_donation, true) + ".");
                        } else {
                            $(".monetary-donation-button button").attr("disabled", true);

                            var the_donation = {

                                to: money.data(yootil.page.member.id()),
                                amount: parseFloat(donation_amount),

                                message: {
                                    text: message,
                                    len: this.settings.message_max_len
                                },

                                from: {
                                    id: yootil.user.id(),
                                    name: yootil.user.name()
                                }

                            };

                            if(money.data(yootil.user.id()).donation.send(the_donation)){
                                this.cancel_expiration();
                                this.update_wallet();
                                money.sync.trigger();

                                // Create notification of sent donation

                                monetary.create_notification("[D:" + the_donation.amount + "|" + the_donation.from.id + "|" + the_donation.from.name + "]", yootil.page.member.id());

                                $("#monetary-donation-page-expiry").html("Sent");

                                $(".monetary-donation-avatar-img").html("<img src='" + money.images.info + "' />");
                                $(".monetary-donation-fields").html("<div style='margin-left: 5px; margin-top: 10px'>" + this.settings.text.donation + " successfully sent.<br /><br />If the recipient does not accept your " + this.settings.text.donation.toLowerCase() + ", you will be notified and refunded.</div>");
                            } else {
                                $("#monetary-donation-page-expiry").html("Error");
                                $(".monetary-donation-avatar-img").html("<img src='" + money.images.info + "' />");
                                $(".monetary-donation-fields").html("<div style='margin-left: 5px; margin-top: 10px'>An error has occurred.<br /><br />If you continue to get this message, please contact a member of staff.</div>");
                            }
                        }
                    }
                }
            },

            /**
             * Updates the users wallet when a donation has been sent.
             */

            update_wallet: function(){
                $("#pd_money_wallet_amount").html(yootil.html_encode(money.data(yootil.user.id()).get.money(true)));
            },

            /**
             * Displays an error to the user.
             *
             * @param {String} error
             */

            donation_error: function(error){
                var elem = $("span#pd_donation_amount_error");

                if(elem.html() != error){
                    elem.stop(true, false);
                    elem.html(" " + error).fadeIn("slow").fadeTo(4000, 1).fadeOut("slow", function(){
                        elem.html("");
                    });
                }
            }

        };

    })().register();

    /**
     * @class monetary.gift
     * @static
     *
     * Gift money module handles giving out created gift codes to members.
     */

    money.gift = (function(){

        return {

            /**
             * @property {Object} settings Default settings which can be overwritten from setup.
             * @property {Boolean} settings.enabled Module enabled or not.
             * @property {Number} settings.paid_into Where the money is going to be paid into.
             * @property {Array} codes Active codes that are create in the plugin settings.
             */

            settings: {

                enabled: true,
                paid_into: 0,
                codes: []

            },

            /**
             * @property {Object} lookup All gift objects go ito this object for quick lookup.
             */

            lookup: {},

            /**
             * @property {Array} array_lookup All unique gift code strings are pushed into this lookup array.
             */

            array_lookup: [],

            /**
             * @property {String} current_code The current gift code the user is trying to access.
             */

            current_code:  "",

            /**
             * This is called from the main class.  Each module gets registered and a loop goes through and calls this.
             */

            init: function(){

                // Basic checking so we don't need to run setup on each page

                if(yootil.user.logged_in() && money.can_earn_money){
                    this.setup();

                    if(!this.settings.enabled){
                        money.show_default();
                        return;
                    }

                    this.add_to_yootil_bar();

                    if(location.href.match(/\?monetarygift=(.+?)?$/i)){
                        var unsafe_code = decodeURIComponent(RegExp.$1);

                        yootil.create.nav_branch(yootil.html_encode(location.href), "Gift Money");
                        yootil.create.page("?monetarygift", "Gift Money");

                        if(!this.gift_money()){
                            var code_msg = "";

                            if(unsafe_code && unsafe_code.length){
                                code_msg = " quoting the code \"<strong>" + yootil.html_encode(unsafe_code) + "</strong>\"";
                            }

                            this.show_error("<p>The gift code you are trying to access either isn't for you, doesn't exist, or you have already accepted.</p><p>If you think this is an error, please contact a member of staff" + code_msg + ".</p>");
                        }
                    }
                }
            },

            /**
             * Handles overwriting default values.  These come from the plugin settings.
             * Also populates the lookup object and array.
             */

            setup: function(){
                if(money.plugin){
                    var settings = money.plugin.settings;

                    this.settings.enabled = (!! ~~ settings.free_money_enabled)? true : false;
                    this.settings.paid_into = (!! ~~ settings.free_money_paid_into)? 1 : 0;
                    this.settings.codes = (settings.free_money_codes && settings.free_money_codes.length)? settings.free_money_codes : [];

                    if(!money.bank.settings.enabled){
                        this.settings.paid_into = 0;
                    }

                    if(settings.gift_money_image && settings.gift_money_image.length){
                        money.images.giftmoney = settings.gift_money_image;
                    }

                    if(settings.gift_money_image_small && settings.gift_money_image_small.length){
                        money.images.giftmoneysmall = settings.gift_money_image_small;
                    }

                    for(var c = 0, l = this.settings.codes.length; c < l; c ++){
                        this.lookup[this.settings.codes[c].unique_code.toLowerCase()] = {
                            code: this.settings.codes[c].unique_code.toLowerCase(),
                            amount: this.settings.codes[c].amount,
                            message: this.settings.codes[c].message,
                            members: this.settings.codes[c].members,
                            groups: this.settings.codes[c].groups,
                            show_icon: (this.settings.codes[c].show_gift_icon && this.settings.codes[c].show_gift_icon == "0")? false : true
                        };

                        this.array_lookup.push(this.settings.codes[c].unique_code.toLowerCase());
                    }
                }
            },

            /**
             * Registers this module to the money class.
             * @returns {Object}
             */

            register: function(){
                money.modules.push(this);
                return this;
            },

            /**
             * Adds gift icon to the yootil bar if the icon is enabled.
             */

            add_to_yootil_bar: function(){
                for(var key in this.lookup){
                    if(this.lookup[key].show_icon){
                        if(!this.has_received(key) && this.allowed_gift(this.lookup[key])){
                            yootil.bar.add("/?monetarygift=" + key, money.images.giftmoneysmall, "Gift Money", "gift_" + key);
                        }
                    }
                }
            },

            /**
             * Creates an error container and shows the message to the user.
             *
             * @param {String} msg The message to show.
             */

            show_error: function(msg){
                var html = "";

                html += "<div class='monetary-gift-notice-icon'><img src='" + money.images.giftmoney + "' /></div>";
                html += "<div class='monetary-gift-notice-content'>" + msg + "</div>";

                var container = yootil.create.container("An Error Has Occurred", html).show();

                container.appendTo("#content");
            },

            /**
             * Handles gifting the money to the user if the gift code is valid and not already accepted.
             *
             * @returns {Boolean}
             */

            gift_money: function(){
                var code = this.get_gift_code();
                var gift = this.valid_code(code);

                if(gift){
                    if(!this.has_received(code) && this.allowed_gift(gift)){
                        var html = "";
                        var paid_where = (this.settings.paid_into == 1)? money.bank.settings.text.bank : money.settings.text.wallet;

                        html += "<div class='monetary-gift-notice-icon'><img src='" + money.images.giftmoney + "' /></div>";
                        html += "<div class='monetary-gift-notice-content'><div class='monetary-gift-notice-content-top'><p>You have recieved a gift of <strong>" + money.settings.money_symbol + yootil.html_encode(yootil.number_format(money.format(gift.amount))) + "</strong> that will be paid into your " + paid_where + ".</p>";

                        if(gift.message.length){
                            html += "<p>" + gift.message.replace(/\n/g, "<br />") + "</p>";
                        }

                        html+= "</div>";

                        html += "<p class='monetary-gift-notice-content-accept'>Do you want to accept this gift?  <button>Yes</button></p></div><br style='clear: both' />";

                        var container = yootil.create.container("You Have Received Some Money", html).show();
                        var self = this;

                        container.find("button").click(function(){
                            if(self.collect_gift()){
                                var msg = "";

                                msg += "<p>You have successfully received a gift of <strong>" + money.settings.money_symbol + yootil.html_encode(yootil.number_format(money.format(gift.amount))) + "</strong>.</p>";
                                msg += "<p>This has been paid into your " + paid_where + ".</p>";

                                $(".monetary-gift-notice-content").html(msg);

                                yootil.bar.remove("gift_" + gift.code);
                            } else {
                                pb.window.alert("An Error Occurred", "Could not collect gift.", {
                                    modal: true,
                                    resizable: false,
                                    draggable: false
                                });
                            }
                        });

                        container.appendTo("#content");

                        return true;
                    }
                }

                return false;
            },

            /**
             * Gives the gift to the user.  This will update the wallet or bank depending on settings.
             *
             * @returns {Boolean}
             */

            collect_gift: function(gift){
                if(this.current_code && this.lookup[this.current_code]){
                    money.data(yootil.user.id()).push.gift(this.current_code);

                    // Add money to wallet or bank

                    var into_bank = false;
                    var amount = this.lookup[this.current_code].amount || 0;

                    if(!amount){
                        return false;
                    }

                    if(this.settings.paid_into == 1){
                        into_bank = true;
                    }

                    money.data(yootil.user.id()).increase[((into_bank)? "bank" : "money")](amount, true);

                    if(into_bank){
                        money.bank.create_transaction(8, amount, 0, true);
                    }

                    this.remove_old_codes();
                    this.save_money_data();

                    money.sync.trigger();

                    return true;
                }

                return false;
            },

            /**
             * Wrapper around user Data class update method to update the key.
             */

            save_money_data: function(){
                money.data(yootil.user.id()).update();
            },

            /**
             * Checks to see if the user is allowed this gift.  Various checks are done here against members and groups.
             *
             * @param {Object} gift The gift.
             * @returns {Boolean}
             */

            allowed_gift: function(gift){
                if(gift){

                    // Check if this is for everyone

                    if(!gift.members.length && !gift.groups.length){
                        return true;
                    } else {

                        // Check members first, this overrides groups

                        if($.inArrayLoose(yootil.user.id(), gift.members) > -1){
                            return true;
                        }

                        // Now check the group

                        var user_groups = yootil.user.group_ids();

                        for(var g = 0, l = user_groups.length; g < l; g ++){
                            if($.inArrayLoose(user_groups[g], gift.groups) > -1){
                                return true;
                            }
                        }
                    }
                }

                return false;
            },

            /**
             * Checks to see if the user has already received the gift.
             *
             * @param {String} code The gift code.
             * @returns {Boolean}
             */

            has_received: function(code){
                if($.inArrayLoose(code, money.data(yootil.user.id()).get.gifts()) != -1){
                    return true;
                }

                return false;
            },

            /**
             * Gets the gift code from the URL.
             *
             * @returns {Mixed}
             */

            get_gift_code: function(){
                var url = location.href;

                if(location.href.match(/\?monetarygift=(\w+)/i)){
                    return RegExp.$1.toLowerCase();
                }

                return false;
            },

            /**
             * Checks to make sure that the code is valid and exists in the lookup table.
             *
             * @returns {Mixed}
             */

            valid_code: function(code){
                if(code){
                    if(this.lookup[code]){
                        this.current_code = code;

                        return this.lookup[code];
                    }
                }

                return false;
            },

            /**
             * Handles removing old codes that do not exist to try and reduce the key length.
             */

            remove_old_codes: function(){
                if(!this.settings.codes.length){
                    money.data(yootil.user.id()).clear.gifts();

                    return;
                }

                var gifts = money.data(yootil.user.id()).get.gifts();
                var len = gifts.length;

                while(len --){
                    if(!this.lookup[gifts[len]]){
                        gifts.splice(len, 1);
                    }
                }

                money.data(yootil.user.id()).set.gifts(gifts);
            }

        };

    })().register();

    /**
     * @class monetary.rank_up
     * @static
     *
     * Awards members money when they rank up.
     */

    money.rank_up = (function(){

        return {

            /**
             * @property {Object} settings Default settings which can be overwritten from setup.
             * @property {Boolean} settings.enabled Module enabled or not.
             * @property {Number} settings.paid_into Where the money is going to be paid into.
             * @property {Number} amount Amount to be paid.
             */

            settings: {

                enabled: true,
                paid_into: 0,
                amount: 500

            },

            /**
             * This is called from the main class.  Each module gets registered and a loop goes through and calls this.
             */

            init: function(){
                var rank = money.data(yootil.user.id()).get.rank();

                money.data(yootil.user.id()).set.rank(rank || yootil.user.rank().id, true);

                // Basic checking so we don't need to run setup on each page

                if(yootil.user.logged_in() && money.can_earn_money && (yootil.location.posting() || yootil.location.thread())){
                    this.setup();
                }
            },

            /**
             * Handles overwriting default values.  These come from the plugin settings.
             */

            setup: function(){
                if(money.plugin){
                    var settings = money.plugin.settings;

                    this.settings.enabled = (!! ~~ settings.rank_up_enabled)? true : false;
                    this.settings.amount = (settings.rank_up_how_much && parseInt(settings.rank_up_how_much) > 0)? parseInt(settings.rank_up_how_much) : this.settings.amount;
                    this.settings.paid_into = (!! ~~ settings.rank_up_paid_into)? 1 : 0;

                    if(!money.bank.settings.enabled){
                        this.settings.paid_into = 0;
                    }
                }
            },

            /**
             * Registers this module to the money class.
             * @returns {Object}
             */

            register: function(){
                money.modules.push(this);
                return this;
            },

            /**
             * This is called when we bind the methods (from main monetary class) when key hooking when posting.
             * @returns {Boolean}
             */

            pay: function(){
                if(!this.settings.enabled){
                    return;
                }

                if(this.has_ranked_up()){
                    this.update_rank();
                    this.workout_pay();

                    return true;
                } else if(this.no_rank()){
                    return true;
                }

                return false;
            },

            /**
             * Here we workout the pay the user should be getting and increase either the bank or wallet values.
             * If the bank is the option to be paid into, we also create a transaction.
             */

            workout_pay: function(){
                var into_bank = false;

                if(this.settings.paid_into == 1){
                    into_bank = true;
                }

                money.data(yootil.user.id()).increase[((into_bank)? "bank" : "money")](parseFloat(this.settings.amount), true);

                if(into_bank){
                    money.bank.create_transaction(6, parseFloat(this.settings.amount), 0, true);
                }
            },

            /**
             * Checks if the user has a rank recorded.
             *
             * @returns {Boolean}
             */

            no_rank: function(){
                if(!money.data(yootil.user.id()).get.rank()){
                    return true;
                }

                return false;
            },

            /**
             * Compares the recorded rank with the users current rank to see if they have ranked up.
             *
             * @returns {Boolean}
             */

            has_ranked_up: function(){
                var current_rank = yootil.user.rank().id;

                if(money.data(yootil.user.id()).get.rank() < current_rank){
                    return true;
                }

                return false;
            },

            /**
             * Updates the users rank in the data object which is stored in the key.
             */

            update_rank: function(){
                money.data(yootil.user.id()).set.rank(yootil.user.rank().id, true);
            }

        };

    })().register();

    /**
     * @class monetary.stock_market
     * @static
     *
     * Allows members buy and sell stocks to try and make a nice profit.
     */

    money.stock_market = (function(){

        return {

            /**
             * @property {Boolean} fetching Used when making the AJAX call to fetch the stock data.
             */

            fetching: false,

            /**
             * @property {Object} data The stock data pulled from the server.
             */

            data: {},

            /**
             * @property {Object} symbols (i.e "GOOG").
             */

            symbols: {},

            /**
             * @property {String} html Generate HTML gets stored here.
             */

            html: "",

            /**
             * @property {Number} current The current index when moving through the stock list.
             */

            current: 1,

            /**
             * @property {Number} total The total number of companies.
             */

            total: 0,

            /**
             * @property {Object} settings Default settings that can be overwritten in setup.
             * @property {Boolean} enabled Module enabled or not.
             * @property {Boolean} show_chart If disabled then the chart will not get shown.
             * @property {Boolean} compact If enabled, then it will use a more compact HTML template for smaller widths.
             * @property {Object} settings.text Default text replacements.
             * @property {String} settings.text.stock_market
             * @property {String} settings.text.investments
             */

            settings: {
                enabled: true,
                show_chart: true,
                compact: false,

                text: {

                    stock_market: "Stock Market",
                    investments: "Investments"

                }
            },

            /**
             * @property {Object} replacements Some forums like to rename the stock info, so here we hold the replacements.
             */

            replacements: {},

            /**
             * @property {Object} invest_data The users investment data.
             */

            invest_data: {},

            /**
             * This is called from the main class.  Each module gets registered and a loop goes through and calls this.
             */

            init: function(){
                if(!yootil.user.logged_in()){
                    return;
                }

                this.setup();

                if(this.settings.enabled){
                    if(money.images.stock_market){
                        yootil.bar.add("/?stockmarket", money.images.stock_market, "Stock Market", "pdmsstock");
                    }
                } else {
                    this.offer_full_refund();
                }

                if(yootil.location.forum() && location.href.match(/\/?\?stockmarket\/?/i)){
                    if(this.settings.enabled){
                        money.can_show_default = false;
                        this.start();
                    } else {
                        money.show_default();
                    }
                }
            },

            /**
             * Registers this module to the money class.
             * @returns {Object}
             */

            register: function(){
                money.modules.push(this);
                return this;
            },

            /**
             * Creates the stock market page, fetches stock data.
             */

            start: function(){
                this.html = "<div id='stock-wrapper'><img src='" + money.images.preloader + "' /></div>";
                this.fetch_stock_data();

                yootil.create.page("?stockmarket", this.settings.text.stock_market);
                yootil.create.nav_branch("/?stockmarket", this.settings.text.stock_market);

                yootil.create.container("<div style='display: inline;'>" + this.settings.text.stock_market + " Investments</div><div style='float: right'>" + money.settings.text.wallet + ": " + money.settings.money_symbol + "<span id='pd_money_wallet_amount'>" + yootil.html_encode(money.data(yootil.user.id()).get.money(true)) + "</span></div>", "<div id='stock-invest-content'><img src='" + money.images.invest_preloader + "' /></div>").show().appendTo("#content");

                yootil.create.container("<div style='display: inline;'>" + this.settings.text.stock_market + "<span id='stock-market-total'></span></div><div style='cursor: pointer; float: right'><span id='stock-left'>&laquo; Previous</span> &nbsp;&nbsp;&nbsp; <span id='stock-right'>Next &raquo;</span></div>", this.html).show().appendTo("#content");
            },

            /**
             * Handles overwriting default values.  These come from the plugin settings.
             */

            setup: function(){
                if(money.plugin){
                    var settings = money.plugin.settings;

                    this.settings.enabled = (settings.stock_enabled == "0")? false : true;
                    this.settings.show_chart = (settings.stock_show_chart == "0")? false : true;
                    this.settings.compact = (settings.compact_layout && settings.compact_layout == 1)? true : false;
                    this.settings.compact_width = (settings.stock_block_width && parseInt(settings.stock_block_width) > 0)? settings.stock_block_width : "600";

                    if(parseInt(this.settings.compact_width) < 533){
                        this.settings.compact_width = 533;
                    }

                    if(settings.stock_up_image && settings.stock_up_image.length){
                        money.images.up = settings.stock_up_image;
                    }

                    if(settings.stock_down_image && settings.stock_down_image.length){
                        money.images.down = settings.stock_down_image;
                    }

                    if(settings.stock_market_icon && settings.stock_market_icon.length){
                        money.images.stock_market = settings.stock_market_icon;
                    }

                    if(settings.stock_replace && settings.stock_replace.length){
                        for(var r = 0, l = settings.stock_replace.length; r < l; r ++){
                            this.replacements[settings.stock_replace[r].current_symbol] = settings.stock_replace[r];
                        }
                    }

                    this.settings.text.stock_market = (settings.stock_market_text && settings.stock_market_text.length)? settings.stock_market_text : this.settings.text.stock_market;
                }
            },

            /**
             * Data from the server needs escaping otherwise it breaks selectors.
             *
             * @returns {String}
             */

            escape_expression: function(expr){
                return expr.replace(".", "\\.");
            },

            /**
             * Gets the stock name.  This checks in the replacements object to see if the forum has custom info they want to change.
             *
             * @param {String} stock_id The stock we want to look up.
             */

            get_stock_name: function(stock_id){
                if(this.replacements[stock_id] && this.replacements[stock_id].new_name.length){
                    return this.replacements[stock_id].new_name;
                }

                if(this.symbols[stock_id]){
                    return this.symbols[stock_id].Name;
                }

                return stock_id;
            },

            /**
             * Gets the stock symbol, but checks if a replacement is needed first.
             *
             * @returns {String}
             */

            get_stock_symbol: function(stock_id){
                if(this.replacements[stock_id] && this.replacements[stock_id].new_symbol.length){
                    return this.replacements[stock_id].new_symbol;
                }

                return stock_id;
            },

            /**
             * Gets the stock data from the server.  This data is pulled in from Yahoo and parsed.
             */

            fetch_stock_data: function(){
                this.fetching = true;

                $.ajax({
                    url: "http://pixeldepth.net/proboards/plugins/monetary_system/stock/quotes.php",
                    context: this,
                    crossDomain: true,
                    dataType: "json"
                }).done(function(data){
                    this.fetching = false;

                    if(data && data.results && data.results.length){
                        this.data = data.results;

                        /**
                         * Triggers when the AJAX request is done and has the stock data.
                         *
                         *     $(monetary.event).on("stock_market.data_request_done", function(event, data){
                         *         console.log(data);
                         *     });
                         *
                         * @event data_request_done
                         */

                        $(monetary.event).trigger("stock_market.data_request_done", {

                            results: data.results

                        });
                    }

                    this.build_stock_table();
                });
            },

            /**
             * Checks to see if the user has invested in certain stock.
             *
             * @param {String} stock_symbol
             * @returns {Boolean}
             */

            has_invested: function(stock_symbol){
                var invest_data = money.data(yootil.user.id()).get.investments();

                if(invest_data[stock_symbol]){
                    return true;
                }

                return false;
            },

            /**
             * Removes stock from the users stock data.
             *
             * @param {String} stock_symbol The stock to be removed.
             */

            remove_from_data: function(stock_symbol){
                if(this.has_invested(stock_symbol)){
                    var invest_data = money.data(yootil.user.id()).get.investments();

                    delete invest_data[stock_symbol];
                    money.data(yootil.user.id()).set.investments(invest_data, true);
                }
            },

            /**
             * If for some reason this module is disabled, then it gives the user the option to get a full refund.
             */

            offer_full_refund: function(){
                var show = (yootil.storage.get("monetary_stock_ignore_refund") == 1)? false : true;

                if(!show){
                    return;
                }

                var total_stocks = 0;
                var total_value = 0;
                var invest_data = money.data(yootil.user.id()).get.investments();

                for(var stock in invest_data){
                    var amount = this.invest_amount(stock);
                    var bid = invest_data[stock].b;
                    var total_cost = (parseFloat(bid) * amount);

                    total_value += total_cost;
                    total_stocks ++;
                }

                if(total_stocks && total_value){
                    var info = "";
                    var self = this;

                    info += "Your investments can be refunded, as the";
                    info += " Stock Market is currently disabled.<br /><br />";
                    info += "Refund: " + money.settings.money_symbol + yootil.html_encode(yootil.number_format(money.format(total_value, true)));

                    pb.window.dialog("stock-refund-dialog", {
                        modal: true,
                        height: 220,
                        width: 320,
                        title: "Refunding All Stock",
                        html: info,
                        resizable: false,
                        draggable: false,

                        buttons: {

                            "Ignore Refund": function(){
                                var self = this;

                                pb.window.dialog("stock-ignore-refund-dialog", {
                                    modal: true,
                                    height: 220,
                                    width: 320,
                                    title: "Ignore Refund",
                                    html: "Are you sure you want to keep your current investments?<br /><br />You will no longer receive the refund message if you choose this option.",
                                    resizable: false,
                                    draggable: false,

                                    buttons: {

                                        "Ok": function(){
                                            yootil.storage.set("monetary_stock_ignore_refund", 1, false, true);
                                            $(this).dialog("close");
                                            $(self).dialog("close");
                                        },

                                        "Cancel": function(){
                                            $(this).dialog("close");
                                        }

                                    }

                                });

                            },

                            "Accept Refund": function(){
                                money.data(yootil.user.id()).increase.money(total_value, true);
                                money.data(yootil.user.id()).clear.investments(true);

                                self.save_investments();

                                $(this).dialog("close");
                            }
                        }
                    });
                }
            },

            /**
             * Handles refunding for the user.
             *
             * @param {String} stock_id
             */

            refund_stock: function(stock_id){
                var self = this;
                var info = "";
                var invest_data = money.data(yootil.user.id()).get.investments();

                info += "Your investment in " + yootil.html_encode(this.get_stock_symbol(stock_id)) + " is being refunded, as the";
                info += " stock has been removed from the market.<br /><br />";
                info += "Refund: " + money.settings.money_symbol + yootil.html_encode(yootil.number_format(money.format(parseInt(invest_data[stock_id].a) * parseFloat(invest_data[stock_id].b), true)));

                pb.window.dialog("stock-refund-dialog", {
                    modal: true,
                    height: 220,
                    width: 320,
                    title: "Refunding Stock",
                    html: info,
                    resizable: false,
                    draggable: false,

                    buttons: {

                        "Accept Refund": function(){

                            var amount = (self.has_invested(stock_id))? self.invest_amount(stock_id) : 0;

                            if(amount){
                                var bid = invest_data[stock_id].b;
                                var total_cost = (parseFloat(bid) * amount);

                                money.data(yootil.user.id()).increase.money(total_cost, true);
                                self.remove_from_data(stock_id);
                                self.update_wallet();
                                self.save_investments();
                            }

                            $(this).dialog("close");
                        }
                    }
                });
            },

            /**
             * Check how much the user has invested.
             *
             * @param {String} stock_symbol
             * @returns {Number} The amount of stock invested.
             */

            invest_amount: function(stock_symbol){
                var invest_data = money.data(yootil.user.id()).get.investments();

                if(this.has_invested(stock_symbol)){
                    return invest_data[stock_symbol].a;
                }

                return 0;
            },

            /**
             * Saves the users investments to the key and triggers a sync call.
             */

            save_investments: function(){
                money.data(yootil.user.id()).update();
                money.sync.trigger();
            },

            /**
             * Inserts a new investment row when the user buys stock.
             *
             * @param {String} stock_id
             */

            insert_invest_row: function(stock_id){
                var invest_data = money.data(yootil.user.id()).get.investments();

                var new_bid_total = (parseInt(invest_data[stock_id].a) * parseFloat(this.symbols[stock_id].BidRealtime));
                var old_bid_total = (parseInt(invest_data[stock_id].a) * parseFloat(invest_data[stock_id].b));
                var html = "<tr class='stock-invest-content-row' id='stock-invest-row-" + yootil.html_encode(stock_id) + "' style='display: none'>";

                html += "<td>" + this.get_stock_name(stock_id);

                if(!this.settings.compact){
                    html += " (" + this.get_stock_symbol(stock_id) + ")";
                }

                html += "</td>";
                html += "<td>" + yootil.html_encode(yootil.number_format(invest_data[stock_id].b)) + "</td>";
                html += "<td>" + yootil.html_encode(yootil.number_format(this.symbols[stock_id].BidRealtime)) + "</td>";

                if(!this.settings.compact){
                    html += "<td>" + yootil.html_encode(yootil.number_format(invest_data[stock_id].a)) + "</td>";
                }

                html += "<td>" + money.settings.money_symbol + yootil.html_encode(yootil.number_format(money.format(parseInt(invest_data[stock_id].a) * parseFloat(invest_data[stock_id].b), true))); + "</td>";
                html += "<td>" + money.settings.money_symbol + yootil.html_encode(yootil.number_format(money.format(new_bid_total - old_bid_total, true))) + "</td>";
                html += "<td><button class='stock-sell-button' data-stock-id='" + yootil.html_encode(stock_id) + "'>Sell</button></td>";

                html += "</tr>";

                var self = this;

                if(!$("#stock-investments-table").length){
                    this.create_investment_headers();
                }

                if($("#stock-invest-row-" + this.escape_expression(stock_id)).length){
                    $("#stock-invest-row-" + this.escape_expression(stock_id)).replaceWith($(html));
                } else {
                    $("#stock-investments-table").append($(html).hide());
                }

                $("#stock-investments-table").find(".stock-sell-button[data-stock-id=" + this.escape_expression(stock_id) + "]").click(function(){
                    $.proxy(self.bind_sell_event, self)(this);
                });

                $("#stock-invest-row-" + this.escape_expression(stock_id)).show("normal");
            },

            /**
             * Removes an investment row from the list of investments for the user.
             *
             * @param {String} stock_id
             */

            remove_invest_row: function(stock_id){
                $("#stock-invest-row-" + this.escape_expression(stock_id)).hide("normal", function(){
                    $(this).remove();

                    var invest_table = $("#stock-investments-table");

                    if(invest_table.find("tr").length == 1){
                        invest_table.remove();
                        $("#stock-invest-content").html("<span>You currently have no investments.</span>");
                    }
                });
            },

            /**
             * When the user buys stock, we update the wallet on the page.
             */

            update_wallet: function(){
                $("#pd_money_wallet_amount").html(yootil.html_encode(money.data(yootil.user.id()).get.money(true)));
            },

            /**
             * Handles the buying aspect of stocks.
             *
             * @param {String} stock_symbol The stock to invest in.
             * @param {Number} amount The amount of stock to buy.
             * @param {Boolean} insert_invest_row If true, a new investment row is added to the list.
             */

            buy_stock: function(stock_symbol, amount, insert_invest_row){
                if(stock_symbol && amount && this.stock_exists(stock_symbol)){
                    var current_amount = (this.has_invested(stock_symbol))? this.invest_amount(stock_symbol) : 0;
                    var updating = (current_amount)? false : true;
                    var total_amount = (current_amount + amount);
                    var bid = this.symbols[stock_symbol].BidRealtime;
                    var total_cost = (bid * amount);

                    if(money.data(yootil.user.id()).get.money() < total_cost){
                        pb.window.alert("Not Enough " + money.settings.money_text, "You do not have enough " + money.settings.money_text.toLowerCase() + " to make this purchase.", {
                            modal: true,
                            resizable: false,
                            draggable: false
                        });
                    } else {
                        money.data(yootil.user.id()).decrease.money(total_cost);

                        var invest_data = money.data(yootil.user.id()).get.investments();

                        invest_data[stock_symbol] = {
                            a: total_amount,
                            b: bid
                        };

                        money.data(yootil.user.id()).set.investments(invest_data, true);

                        this.insert_invest_row(stock_symbol);
                        this.update_wallet();
                        this.save_investments();
                    }
                } else {
                    pb.window.alert("An Error Occurred", "An error occurred, please try again.", {
                        modal: true,
                        resizable: false,
                        draggable: false
                    });
                }
            },

            /**
             * Checks to see stock exists.
             *
             * @param {String} stock_symbol
             * @returns {Boolean}
             */

            stock_exists: function(stock_symbol){
                if(this.symbols[stock_symbol]){
                    return true;
                }

                return false;
            },

            /**
             * Creates the investment headers for the investment list for the user.
             *
             * @param {Boolean} return_html If true, the HTML is returned.
             * @returns {String}
             */

            create_investment_headers: function(return_html){
                var html = "";

                html += "<table id='stock-investments-table'><tr class='stock-invest-content-headers'>";
                html += "<th style='width: 30%'>Stock Name</th>";
                html += "<th style='width: 12%'>Paid Bid</th>";
                html += "<th style='width: 12%'>Current Bid</th>";

                if(!this.settings.compact){
                    html += "<th style='width: 12%'>Total Units</th>";
                }

                html += "<th style='width: 13%'>Total Cost</th>";
                html += "<th style='width: 15%'>Profit</th>";
                html += "<th style='width: 6%'></th>";
                html += "</tr>";

                if(return_html){
                    return html;
                }

                html += "</table>";

                $("#stock-invest-content").empty().html(html);
            },

            /**
             * Builds the users current investment list.
             */

            current_investment_list: function(){
                var invest = $("#stock-invest-content");
                var html = "";

                html += this.create_investment_headers(true);

                var table = "";

                var invest_data = money.data(yootil.user.id()).get.investments();

                for(var key in invest_data){
                    if(!this.symbols[key]){
                        this.refund_stock(key);
                        continue;
                    }

                    table += "<tr class='stock-invest-content-row' id='stock-invest-row-" + key + "'>";
                    table += "<td>" + yootil.html_encode(this.get_stock_name(key));

                    if(!this.settings.compact){
                        table += " (" + yootil.html_encode(this.get_stock_symbol(key)) + ")";
                    }

                    table += "</td>";

                    table += "<td>" + yootil.html_encode(yootil.number_format(invest_data[key].b)) + "</td>";
                    table += "<td>" + yootil.html_encode(yootil.number_format(this.symbols[key].BidRealtime)) + "</td>";

                    if(!this.settings.compact){
                        table += "<td>" + yootil.html_encode(yootil.number_format(invest_data[key].a)) + "</td>";
                    }

                    table += "<td>" + money.settings.money_symbol + yootil.html_encode(yootil.number_format(money.format(parseInt(invest_data[key].a) * parseFloat(invest_data[key].b), true))); + "</td>";

                    var profit_html = "";
                    var new_bid_total = (parseInt(invest_data[key].a) * parseFloat(this.symbols[key].BidRealtime));
                    var old_bid_total = (parseInt(invest_data[key].a) * parseFloat(invest_data[key].b));
                    var formatted_total = money.settings.money_symbol + yootil.html_encode(yootil.number_format(money.format(new_bid_total - old_bid_total, true)));

                    if(new_bid_total < old_bid_total){
                        profit_html += "<span class='stock-market-loss'>" + formatted_total + "</span> <img src='" + money.images.down + "' style='position: relative; top: 2px;' />";
                    } else {
                        if(new_bid_total > old_bid_total){
                            profit_html += "<span class='stock-market-profit'>" + formatted_total + "</span> <img src='" + money.images.up + "' style='position: relative; top: 2px;' />";
                        } else {
                            profit_html += formatted_total;
                        }
                    }

                    table += "<td>" + profit_html + "</td>";
                    table += "<td><button class='stock-sell-button' data-stock-id='" + yootil.html_encode(key) + "'>Sell</button></td>";
                    table += "</tr>";
                }

                if(!table.length){
                    html = "<span>You currently have no investments.</span>";
                } else {
                    table += "</table>";
                    html += table;
                }

                var stock_invest_obj = $(html);
                var self = this;

                stock_invest_obj.find(".stock-sell-button").click(function(){
                    $.proxy(self.bind_sell_event, self)(this);
                });

                invest.empty().append(stock_invest_obj);
            },

            /**
             * Binds events to handle selling stock.
             *
             * @param {Object} button Button is passed in so we can get the stock id.
             */

            bind_sell_event: function(button){
                var stock_id = $(button).attr("data-stock-id");
                var invest_data = money.data(yootil.user.id()).get.investments();
                var amount = parseInt(invest_data[stock_id].a);
                var bid = parseInt(this.symbols[stock_id].BidRealtime);
                var s = (amount == 1)? "" : "s";
                var info = "";

                info += "<strong>" + yootil.html_encode(this.get_stock_name(stock_id)) + " (" + yootil.html_encode(this.get_stock_symbol(stock_id)) + ")</strong><br /><br />";
                info += "Purchased Amount: " + yootil.html_encode(yootil.number_format(amount)) + " unit" + s + "<br />";
                info += "Paid Bid: " + yootil.html_encode(yootil.number_format(invest_data[stock_id].b)) + "<br />";
                info += "Current Bid: " + yootil.html_encode(yootil.number_format(this.symbols[stock_id].BidRealtime)) + "<br /><br />";
                info += "Total Return: " + money.settings.money_symbol + yootil.html_encode(yootil.number_format(money.format(amount * parseFloat(this.symbols[stock_id].BidRealtime), true)));

                var self = this;

                pb.window.dialog("stock-sell-dialog", {
                    modal: true,
                    height: 220,
                    width: 320,
                    title: "Sell Stock",
                    html: info,
                    resizable: false,
                    draggable: false,

                    buttons: {

                        Cancel: function(){
                            $(this).dialog("close");
                        },

                        "Sell Stock": function(){
                            pb.window.dialog("stock-sell-confirm-dialog", {
                                title: "Confirm Selling Stock",
                                html: "Are you sure you want to sell this stock?",
                                modal: true,
                                resizable: false,
                                draggable: false,

                                buttons: {

                                    No: function(){
                                        $(this).dialog('close');
                                    },

                                    "Yes": function(){
                                        self.sell_stock(stock_id);
                                        $(this).dialog("close");
                                    }
                                }
                            });

                            $(this).dialog("close");
                        }
                    }
                });
            },

            /**
             * If a user sells stock, then we need to remove it from the data, update wallet, and removed the investment
             * row from the list.
             *
             * @param {String} stock_id
             */

            sell_stock: function(stock_id){
                var amount = (this.has_invested(stock_id))? this.invest_amount(stock_id) : 0;

                if(amount){
                    var bid = this.symbols[stock_id].BidRealtime;
                    var total_cost = (parseFloat(bid) * amount);

                    money.data(yootil.user.id()).increase.money(total_cost, true);

                    this.remove_from_data(stock_id);
                    this.update_wallet();
                    this.remove_invest_row(stock_id);
                    this.save_investments();
                }
            },

            /**
             * Builds the stock table.  This allows the user to navigate between each stock.
             */

            build_stock_table: function(){
                var stock_table = $("<div id='stock-content-strip'></div>");
                var self = this;
                var compact_width = col_left_styles = col_center_styles = "";
                var chart_size = "l";

                if(this.settings.compact){
                    chart_size = "m";

                    if(parseInt(this.settings.compact_width) >= 807){
                        chart_size = "l";
                    }
                }

                if(this.settings.compact){
                    compact_width = " style='width: " + this.settings.compact_width + "px'";
                    col_left_styles = " style='width: 48%;'";
                    col_center_styles = " style='width: 48%; margin-right: 0px;'";
                }

                $("#stock-market-total").html(" (" + this.data.length + ")");

                for(var d = 0, dl = this.data.length; d < dl; d ++){
                    var up_down = "";
                    var stock_html = "";

                    if(this.replacements[this.data[d].Symbol] && this.replacements[this.data[d].Symbol].disabled && this.replacements[this.data[d].Symbol].disabled == 1){
                        delete this.replacements[this.data[d].Symbol];
                        continue;
                    }

                    this.symbols[this.data[d].Symbol] = this.data[d];

                    if(parseFloat(this.data[d].PreviousClose) < parseFloat(this.data[d].BidRealtime)){
                        up_down = "<img src='" + money.images.up + "' style='position: relative; top: 2px;' /> ";
                    } else if(parseFloat(this.data[d].PreviousClose) > parseFloat(this.data[d].BidRealtime)){
                        up_down = "<img src='" + money.images.down + "' style='position: relative; top: 2px;' /> ";
                    }

                    if(this.data[d].ChangeAndPercent == 0){
                        this.data[d].ChangeAndPercent = "0.00";
                    }

                    if(this.data[d].RealPercentChange == 0){
                        this.data[d].RealPercentChange = "0.00";
                    }

                    stock_html += "<div class='stock-block'" + compact_width + ">";
                    stock_html += "<div class='stock-block-header'>";
                    stock_html += "<div style='float: left;'>" + yootil.html_encode(this.get_stock_name(this.data[d].Symbol)) + " (" + yootil.html_encode(this.get_stock_symbol(this.data[d].Symbol)) + ") <span style='position: relative; top: -2px;' id='stock-invest-buttons'><button class='stock-buy-button' data-stock-id='" + yootil.html_encode(this.data[d].Symbol) + "'>Buy</button></span></div>";
                    stock_html += "<div style='float: right'>" + yootil.html_encode(this.data[d].BidRealtime) + " " + up_down + "<span style='font-size: 14px;'>" + yootil.html_encode(this.data[d].ChangeAndPercent) + " (" + yootil.html_encode(this.data[d].RealPercentChange) + "%)</span></div><br style='clear: both' /></div>";

                    stock_html += "<table class='stock-block-table-left'" + col_left_styles + ">";

                    stock_html += "<tr>";
                    stock_html += "<td class='stock-block-cell-left'>Previous Close:</td>";
                    stock_html += "<td class='stock-block-cell-right'>" + yootil.html_encode(this.data[d].PreviousClose) + "</td>";
                    stock_html += "</tr>";

                    stock_html += "<tr>";
                    stock_html += "<td class='stock-block-cell-left'>Bid:</td>";
                    stock_html += "<td class='stock-block-cell-right'>" + yootil.html_encode(this.data[d].BidRealtime) + "</td>";
                    stock_html += "</tr>";

                    stock_html += "<tr>";
                    stock_html += "<td class='stock-block-cell-left'>Volume:</td>";
                    stock_html += "<td class='stock-block-cell-right'>" + yootil.html_encode(this.data[d].Volume) + "</td>";
                    stock_html += "</tr>";

                    stock_html += "<tr>";
                    stock_html += "<td class='stock-block-cell-left'>1 Year Target:</td>";
                    stock_html += "<td class='stock-block-cell-right'>" + yootil.html_encode(this.data[d].YearTarget) + "</td>";
                    stock_html += "</tr>";

                    stock_html += "</table>";
                    stock_html += "<table class='stock-block-table-center'" + col_center_styles + ">";

                    stock_html += "<tr>";
                    stock_html += "<td class='stock-block-cell-left'>Open:</td>";
                    stock_html += "<td class='stock-block-cell-right'>" + yootil.html_encode(this.data[d].Open) + "</td>";
                    stock_html += "</tr>";

                    stock_html += "<tr>";
                    stock_html += "<td class='stock-block-cell-left'>Day's Low:</td>";
                    stock_html += "<td class='stock-block-cell-right'>" + yootil.html_encode(this.data[d].DaysLow) + "</td>";
                    stock_html += "</tr>";

                    stock_html += "<tr>";
                    stock_html += "<td class='stock-block-cell-left'>Day's High:</td>";
                    stock_html += "<td class='stock-block-cell-right'>" + yootil.html_encode(this.data[d].DaysHigh) + "</td>";
                    stock_html += "</tr>";

                    stock_html += "<tr>";
                    stock_html += "<td class='stock-block-cell-left'>P/E:</td>";
                    stock_html += "<td class='stock-block-cell-right'>" + yootil.html_encode(this.data[d].PERatio) + "</td>";
                    stock_html += "</tr>";

                    stock_html += "</table>";

                    if(!this.settings.compact){
                        stock_html += "<table class='stock-block-table-right'>";

                        stock_html += "<tr>";
                        stock_html += "<td class='stock-block-cell-left'>Days Range:</td>";
                        stock_html += "<td class='stock-block-cell-right'>" + yootil.html_encode(this.data[d].DaysRange) + "</td>";
                        stock_html += "</tr>";

                        stock_html += "<tr>";
                        stock_html += "<td class='stock-block-cell-left'>52 Week Range:</td>";
                        stock_html += "<td class='stock-block-cell-right'>" + yootil.html_encode(this.data[d].Week52Range) + "</td>";
                        stock_html += "</tr>";

                        stock_html += "<tr>";
                        stock_html += "<td class='stock-block-cell-left'>Market Cap.:</td>";
                        stock_html += "<td class='stock-block-cell-right'>" + yootil.html_encode(this.data[d].MarketCapitalization) + "</td>";
                        stock_html += "</tr>";

                        stock_html += "<tr>";
                        stock_html += "<td class='stock-block-cell-left'>EPS</td>";
                        stock_html += "<td class='stock-block-cell-right'>" + yootil.html_encode(this.data[d].EPS) + "</td>";
                        stock_html += "</tr>";

                        stock_html += "</table>";
                    }

                    stock_html += "<br style='clear: both' />";

                    if(this.settings.show_chart){
                        stock_html += "<div class='stock-block-chart'>";
                        stock_html += "<img src='http://chart.finance.yahoo.com/z?s=" + yootil.html_encode(this.data[d].Symbol) + "&t=2w&l=off&z=" + chart_size + "' />";
                        stock_html += "</div>";
                    }

                    stock_html += "</div>";

                    var stock_obj = $(stock_html);

                    stock_obj.find(".stock-buy-button").click(function(){
                        var stock_id = $(this).attr("data-stock-id");
                        var buy_element = "<div title='Buy Stock (" + yootil.html_encode(self.get_stock_symbol(stock_id)) + ")'><p>Stock Units: <input type='text' style='width: 100px' name='stock-buy-" + yootil.html_encode(stock_id) + "' /></p></div>";

                        var invest_data = money.data(yootil.user.id()).get.investments();

                        if(self.has_invested(stock_id) && self.invest_amount(stock_id) > 0){
                            if(invest_data[stock_id].b != self.symbols[stock_id].BidRealtime){
                                pb.window.alert("An Error Occurred", "You have already made an investment in " + yootil.html_encode(self.get_stock_name(stock_id)) + " (" + yootil.html_encode(self.get_stock_symbol(stock_id)) + ") at a different price.  You will need to sell your current units before investing into this company again.", {
                                    modal: true,
                                    resizable: false,
                                    draggable: false,
                                    width: 350,
                                    height: 200
                                });

                                return;
                            }
                        }

                        $(buy_element).dialog({
                            modal: true,
                            height: 140,
                            width: 300,
                            resizable: false,
                            draggable: false,
                            open: function(){
                                $(this).find("input[name=stock-buy-" + self.escape_expression(stock_id) + "]").val("");
                            },

                            buttons: {

                                Cancel: function(){
                                    $(this).dialog("close");
                                },

                                "Buy Stock": function(){
                                    var amount = parseInt($(this).find("input[name=stock-buy-" + self.escape_expression(stock_id) + "]").val());

                                    if(amount > 0){
                                        var s = (amount == 1)? "" : "s";
                                        var info = "";

                                        info += "<strong>" + yootil.html_encode(self.get_stock_name(stock_id)) + " (" + yootil.html_encode(self.get_stock_symbol(stock_id)) + ")</strong><br /><br />";
                                        info += "Purchase Amount: " + yootil.html_encode(yootil.number_format(amount)) + " unit" + s + "<br />";
                                        info += "Cost Per Unit: " + money.settings.money_symbol + yootil.html_encode(yootil.number_format(self.symbols[stock_id].BidRealtime)) + "<br /><br />";
                                        info += "Total Purchase: " + money.settings.money_symbol + yootil.html_encode(yootil.number_format(money.format(amount * parseFloat(self.symbols[stock_id].BidRealtime), true)));

                                        pb.window.dialog("stock-buy-confirm", {
                                            title: "Confirm Purchase",
                                            html: info,
                                            modal: true,
                                            resizable: false,
                                            draggable: false,

                                            buttons: {

                                                No: function(){
                                                    $(this).dialog('close');
                                                },

                                                "Yes": function(){
                                                    self.buy_stock(stock_id, amount, true);
                                                    $(this).dialog("close");
                                                }
                                            }
                                        });
                                    } else {
                                        pb.window.alert("Invalid Amount", "You need to enter an amount greater than 0.", {
                                            modal: true,
                                            resizable: false,
                                            draggable: false
                                        });
                                    }

                                    $(this).dialog("close");
                                }

                            }
                        });
                    });

                    stock_table.append(stock_obj);

                    this.total ++;
                }

                var stock_content = $("<div id='stock-content'" + compact_width + "></div>").append(stock_table);

                this.html = stock_content;
                this.current_investment_list();
                this.update();
            },

            /**
             * Moves the stock (like a gallery) forward or back.
             */

            update: function(){
                var self = this;
                var pixels = (self.settings.compact)? self.settings.compact_width : "908";

                $("#stock-wrapper").empty().append($(this.html));

                $("#stock-right").click(function(){
                    if(self.current == self.total){
                        return false;
                    }

                    self.current ++;

                    var move_by = "-=" + pixels + "px";

                    $("#stock-content-strip").animate({
                        "left": move_by
                    }, "slow");
                });

                $("#stock-left").click(function(){
                    if(self.current <= 1){
                        return false;
                    }

                    self.current --;

                    var move_by = "+=" + pixels + "px";

                    $("#stock-content-strip").animate({
                        "left": move_by
                    }, "slow");
                });

            }

        };

    })().register();

    /**
     * @class monetary.sync
     * @static
     *
     * Handles syncing the user data between tabs and windows.
     */

    money.sync = (function(){

        return {

            /**
             * Called every page load to make sure we are storing the most up to date data value, or things get messed up.
             */

            init: function(){
                if(!Modernizr.localstorage){
                    return;
                }

                yootil.storage.set("monetary_data_sync_" + yootil.user.id(), money.data(yootil.user.id()).get.data(), true, true);

                var self = this;

                // Delay the binding, IE fires it too quickly, grrr.

                setTimeout(function(){
                    $(window).bind("storage", $.proxy(self.handle_syncing, self));
                }, 100);
            },

            /**
             * Registers this module with the money object.
             * @return {Object} Returns the sync object to be registered.
             */

            register: function(){
                money.modules.push(this);
                return this;
            },

            /**
             * Checks for the original storage event and makes sure we are using the correct key.
             */

            handle_syncing: function(evt){
                if(evt && evt.originalEvent && evt.originalEvent.key == ("monetary_data_sync_" + yootil.user.id())){
                    var self = this;

                    // Again, IE causing us to add in extra steps.
                    // We are trying to prevent the trigger caller from
                    // getting synced, there is no need, as it acts as the
                    // master of the data.

                    if(money.trigger_caller){
                        money.trigger_caller = false;
                        return;
                    }

                    self.sync_data(evt.originalEvent);
                }
            },

            /**
             * Here we sync the data object with the new data, and we also handle visual stuff, we don't have too but it's nice.
             *
             *     We do a straight swap for now, I see no reason not too.
             *
             *    This only is called when an update to the data has happened.
             */

            sync_data: function(evt){
                var old_data = evt.oldValue;
                var new_data = evt.newValue;

                // Stop here if there is no changes, the data is stringified (2 strings)
                // This prevents changing the DOM for no reason

                if(old_data == new_data){
                    return;
                }

                if(new_data && yootil.is_json(new_data)){
                    new_data = JSON.parse(new_data);
                } else {
                    return;
                }

                // Straight up swap of new data, we trust it.

                //money.data = new_data;
                money.data(yootil.user.id()).set.data(new_data, true);

                // Handle gifts

                if(location.href.match(/\?monetarygift=.+?$/i)){
                    var code = money.gift.get_gift_code();
                    var gift = money.gift.valid_code(code);

                    if(!gift || money.gift.has_received(code) || !money.gift.allowed_gift(gift)){
                        $(".monetary-gift-notice-content-top").css("opacity", .3);
                        $(".monetary-gift-notice-content-accept").html("You have accepted this gift in another tab / window.");
                    }
                }

                // Handle donations, make sure the user isn't trying to
                // accept the same donation multiple times

                if(location.href.match(/\?monetarydonation&view=3&id=([\d\.]+)/i)){
                    var don_id = RegExp.$1;
                    var the_donation = money.donation.fetch_donation(don_id);

                    if(!the_donation){
                        clearInterval(money.donation.interval);
                        $(".monetary-donation-form").css("opacity", .3);
                        $(".monetary-donation-button").hide();
                        pb.window.alert("An Error Has Occurred", "This " + money.donation.settings.text.donation.toLowerCase() + " no longer exists.");
                    }
                }

                // Format new money changes

                var user_money = money.data(yootil.user.id()).get.money(true);
                var user_bank_money = money.data(yootil.user.id()).get.bank(true);
                var user_donations_sent = money.data(yootil.user.id()).get.total_sent_donations(true);
                var user_donations_received = money.data(yootil.user.id()).get.total_received_donations(true);

                // Now lets see where we are, and attempt to update visuals

                var location_check = (yootil.location.search_results() || yootil.location.message_thread() || yootil.location.thread() || yootil.location.recent_posts() || yootil.location.profile_home() || yootil.location.members());

                if(location_check){
                    var user_id = yootil.user.id();

                    $(".pd_money_amount_" + user_id).text(yootil.number_format(user_money));
                    $(".pd_bank_amount_" + user_id).text(yootil.number_format(user_bank_money));
                    $(".pd_donations_sent_amount_" + user_id).text(yootil.number_format(user_donations_sent));
                    $(".pd_donations_received_amount_" + user_id).text(yootil.number_format(user_donations_received));

                }

                // See if there is a wallet about

                var wallet = $("#pd_money_wallet_amount");

                if(wallet.length){
                    wallet.text(yootil.number_format(user_money));
                }

                var other_wallet = $(".money_wallet_amount");

                if(other_wallet.length){
                    other_wallet.html(money.settings.text.wallet + money.settings.money_separator + money.settings.money_symbol + yootil.html_encode(user_money));
                }

                // Lets see if it's the bank, if so update the balance.
                // Don't bother with transactions, it's in the data, but
                // no need to visually update it, for now.

                if(yootil.location.forum() && location.href.match(/\/?bank\/?/i)){
                    $("#pd_money_bank_balance").text(yootil.number_format(user_bank_money));
                }

                // Update stock list

                if(yootil.location.forum() && location.href.match(/\/?stockmarket\/?/i)){
                    if(money.stock_market.settings.enabled){
                        money.stock_market.check_for_data();
                        money.stock_market.current_investment_list();
                    }
                }
            },

            /**
             * Sometimes we need to trigger the sync (i.e edit money dialog) manually.
             */

            trigger: function(){
                if(!Modernizr.localstorage){
                    return;
                }

                money.trigger_caller = true;
                yootil.storage.set("monetary_data_sync_" + yootil.user.id(), money.data(yootil.user.id()).get.data(), true, true);
            }

        };

    })().register();

    /**
     * @class monetary.wages
     * @static
     *
     * Allows members and staff to earn wages from actively posting.
     */

    money.wages = (function(){

        return {

            /**
             * @property {Object} data contains various bits of data that are stored in the key to do with wages.
             * @property {Number} data.p Current posts for the user.  This gets reset based on expiry time.
             * @property {Number} data.e This is the timestamp for when the data gets reset.
             * @property {Number} data.w When they get paid (1 - 4).
             * @property {Number} data.s Staff expiry timestamp.
             */

            data: {

                // Posts

                p: 0,

                // Timestamp expiry

                e: 0,

                // When do they get paid

                w: 0,

                // Staff expiry

                s: 0
            },

            /**
             * @property {Object} settings Holds default settings that can be overwritten from setup.
             * @property {Boolean} settings.enabled Module enabled or not.
             * @property {Number} settings.how_often How often the user is paid.
             * @property {Boolean} settings.bonuses_enabled Extra bonuses on top of the wage if enabled.
             * @property {Number} settings.bonus_amount The percentage amount to be given.
             * @property {Number} settings.paid_into Wallet or Bank.
             * @property {Array} settings.rules These are the autoform rules for members (i.e X posts = X money).
             * @property {Array} settings.staff_rules Rules for staff.
             */

            settings: {

                enabled: true,
                how_often: 2,
                bonuses_enabled: true,
                bonus_amount: 10,
                paid_into: 0,

                rules: [],
                staff_rules: []

            },

            /**
             * @property {Object} ms Holds the milliseconds for day and week to save computing it later.
             * @property {Number} ms.day The total milliseconds for a day.
             * @property {Number} ms.week The total milliseconds for a week.
             */

            ms: {

                day: 86400000,
                week: 604800000

            },

            /**
             * This is called from the main class.  Each module gets registered and a loop goes through and calls this.
             */

            init: function(){

                // Basic checking so we don't need to run setup on each page

                if(yootil.user.logged_in() && money.can_earn_money && (yootil.location.posting() || yootil.location.thread())){
                    this.setup();
                }
            },

            /**
             * Handles overwriting default values.  These come from the plugin settings.
             */

            setup: function(){
                if(money.plugin){
                    var settings = money.plugin.settings;

                    this.settings.enabled = (!! ~~ settings.wages_enabled)? true : false;
                    this.settings.how_often = (settings.wages_how_often && parseInt(settings.wages_how_often) > 0)? parseInt(settings.wages_how_often) : this.settings.how_often;
                    this.settings.bonuses_enabled = (!! ~~ settings.wages_enable_bonuses)? true : false;
                    this.settings.bonus_amount = (settings.wages_bonus_amount && parseInt(settings.wages_bonus_amount) > 0)? parseInt(settings.wages_bonus_amount) : this.settings.bonus_amount;
                    this.settings.paid_into = (!! ~~ settings.wages_paid_into)? 1 : 0;
                    this.settings.rules = (settings.wage_rules && settings.wage_rules.length)? settings.wage_rules : [];
                    this.settings.staff_rules = (settings.staff_wage_rules && settings.staff_wage_rules.length)? settings.staff_wage_rules : [];

                    if(!money.bank.settings.enabled){
                        this.settings.paid_into = 0;
                    }

                    // Disable wages if there are no rules

                    if(!this.settings.rules.length && (!this.settings.staff_rules.length || !yootil.user.is_staff())){
                        this.settings.enabled = false;
                    }

                    var data = money.data(yootil.user.id()).get.wages();

                    if(!data.p){
                        data.p = 0;
                    } else {
                        data.p = parseInt(data.p);
                    }

                    if(data.e){
                        data.e = parseInt(data.e);

                        // Fix expire bug, set correct day if it's invalid

                        if(data.e.toString().length < 6){
                            data.e = (+ new Date());
                        }
                    }

                    if(!data.w){
                        data.w = parseInt(this.settings.how_often);
                    } else {
                        data.w = parseInt(data.w);
                    }

                    if(data.s){
                        data.s = parseInt(data.s);
                    } else {
                        data.s = (+ new Date());
                    }

                    money.data(yootil.user.id()).set.wages(data, true);
                }
            },

            /**
             * Registers this module to the money class.
             * @returns {Object}
             */

            register: function(){
                money.modules.push(this);
                return this;
            },

            /**
             * This is called when we bind the methods (from main monetary class) when key hooking when posting.
             * @returns {Boolean}
             */

            pay: function(){
                if(!this.settings.enabled){
                    return false;
                }

                this.workout_pay();
                this.workout_staff_pay();

                return true;
            },

            /**
             * This is called when we bind the methods (from main monetary class) when key hooking when posting.
             */

            pay_staff: function(){
                this.workout_staff_pay();
            },

            /**
             * Handles working out the pay for staff.
             */

            workout_staff_pay: function(){
                var amount_per_period = this.get_staff_wage_amount();
                var now = new Date();
                var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                var data = money.data(yootil.user.id()).get.wages();

                if(!amount_per_period){
                    if(!data.s){
                        data.s = today.getTime();
                        money.data(yootil.user.id()).set.wages(data, true);
                    }

                    return;
                }

                var last_paid = (data.s)? (money.correct_date(data.s)) : today.getTime();
                var when = (data.w)? data.w : this.settings.how_often;
                var diff = Math.abs(today - last_paid);
                var amount = 0;

                switch(when){

                    case 1 :
                        var days = Math.floor(diff / this.ms.day);

                        amount = (days * amount_per_period);
                        break;

                    case 2 :
                        var weeks = Math.floor(diff / this.ms.week);

                        amount = (weeks * amount_per_period);
                        break;

                    case 3 :
                        var fortnights = Math.floor(diff / (this.ms.week * 2));

                        amount = (fortnights * amount_per_period);
                        break;

                    case 4 :
                        var months = Math.floor(diff / (this.ms.week * 4));

                        amount = (months * amount_per_period);
                        break;

                }

                if(amount){
                    var into_bank = false;

                    if(this.settings.paid_into == 1){
                        into_bank = true;
                    }

                    money.data(yootil.user.id()).increase[((into_bank)? "bank" : "money")](amount, true);

                    if(into_bank){
                        money.bank.create_transaction(7, amount, 0, true);
                    }

                    var data = money.data(yootil.user.id()).get.wages();

                    data.s = today.getTime();
                    money.data(yootil.user.id()).set.wages(data, true);
                }
            },

            /**
             * Handles working out the pay for members.
             */

            workout_pay: function(){
                var data = money.data(yootil.user.id()).get.wages();
                var now = new Date();
                var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                var wage_amount = 0;
                var wage_bonus = 0;
                var when = (data.w)? data.w : this.settings.how_often;
                var set_wage = false;

                switch(when){

                    // Daily

                    case 1 :

                        // Set default if no expire is set

                        this.set_default(today, this.settings.how_often);

                        var expires = data.e;

                        if(today.getTime() >= (expires - this.ms.day) && today.getTime() <= expires){
                            data.p ++;
                        } else {
                            set_wage = true;
                        }

                        break;

                    // Weekly

                    case 2 :

                        this.set_default(today, this.settings.how_often);

                        var expires = data.e;

                        if(today.getTime() >= (expires - this.ms.week) && today.getTime() <= expires){
                            data.p ++;
                        } else {
                            set_wage = true;
                        }

                        break;

                    // Fortnightly

                    case 3 :

                        this.set_default(today, this.settings.how_often);

                        var expires = data.e;

                        if(today.getTime() >= (expires - (this.ms.week * 2)) && today.getTime() <= expires){
                            data.p ++;
                        } else {
                            set_wage = true;
                        }

                        break;

                    // Monthly

                    case 4 :

                        this.set_default(today, this.settings.how_often);

                        var expires = data.e;
                        var expires_date = new Date(expires);
                        var new_expires_ts = new Date(expires_date.getFullYear(), expires_date.getMonth() - 1, expires_date.getDate()).getTime();

                        if(today.getTime() >= new_expires_ts && today.getTime() <= expires){
                            data.p ++;
                        } else {
                            set_wage = true;
                        }

                        break;

                }

                if(set_wage){
                    wage_amount = this.get_wage_amount();
                    wage_bonus = this.get_wage_bonus();

                    if(wage_amount == 0){
                        wage_bonus = 0;
                    }

                    this.set_default(today, this.settings.how_often, true);
                }

                if(!this.settings.bonuses_enabled){
                    wage_bonus = 0;
                }

                this.total_earned_amount = (parseFloat(wage_amount) + parseFloat(wage_bonus));

                money.data(yootil.user.id()).set.wages(data, true);

                this.update_data();
            },

            /**
             * Sets up some defaults for posts and expirations.
             *
             * If settings changes how often the member is paid, we use the stored value for the member until
             * it expires, and we keep checking so we make sure to get the member onto the forum default setting.
             *
             * @param {Object} todays_date Date object for todays date and time.
             * @param {Number} when When the user is being paid (1, 7, 14 days, and also 1 month).
             * @param {Boolean} reset Resets the popsts and when properties for the users object that is stored in the key.
             */

            set_default: function(todays_date, when, reset){

                switch(when){

                    case 1:
                        this.set_expiry(todays_date, 0, 1, reset);
                        break;

                    case 2:
                        this.set_expiry(todays_date, 0, 7, reset);
                        break;

                    case 3:
                        this.set_expiry(todays_date, 0, 14, reset);
                        break;

                    case 4:
                        this.set_expiry(todays_date, 1, 0, reset);
                        break;

                }

                if(reset){
                    var data = money.data(yootil.user.id()).get.wages();

                    data.p = 0;
                    data.w = when;

                    money.data(yootil.user.id()).set.wages(data, true);
                }
            },

            /**
             * Sets the expiry date to a custom date.
             *
             * @param {Object} todays_date Date object for todays date and time.
             * @param {Number} months Months to add onto the date.
             * @param {Number} days Days to add onto the date.
             * @param {Boolean} reset If true, it will reset the expiration date.
             */

            set_expiry: function(todays_date, months, days, reset){
                var data = money.data(yootil.user.id()).get.wages();

                if(!data.e || !data.e.toString().length || typeof parseInt(data.e) != "number" || reset){
                    data.e = new Date(todays_date.getFullYear(), todays_date.getMonth() + months, todays_date.getDate() + days).getTime();
                    money.data(yootil.user.id()).set.wages(data, true);
                }
            },

            /**
             * Updates the users data object with the new values.  This also handles creating the bank
             * transaction if the bank option is enabled instead of wallet.
             *
             * @param {Boolean} reset If true, the posts, expiration date, and when to be paid is reset to 0.
             */

            update_data: function(reset){
                var data = money.data(yootil.user.id()).get.wages();

                if(reset){
                    data.p = data.e = data.w = 0;
                }

                money.data(yootil.user.id()).set.wages(data, true);

                if(this.total_earned_amount > 0){
                    var into_bank = false;

                    if(this.settings.paid_into == 1){
                        into_bank = true;
                    }

                    money.data(yootil.user.id()).increase[((into_bank)? "bank" : "money")](this.total_earned_amount, true);

                    if(into_bank){
                        money.bank.create_transaction(5, this.total_earned_amount, 0, true);
                    }
                }
            },

            /**
             * Gets the highest possible wage amount for the user.
             *
             * @returns {Number}
             */

            get_wage_amount: function(){
                var data = money.data(yootil.user.id()).get.wages();
                var rules = this.settings.rules;
                var amount = 0;

                // Loop through and find highest possible wage

                for(var a = 0, l = rules.length; a < l; a ++){
                    if(data.p >= parseInt(rules[a].posts)){
                        amount = parseFloat(rules[a].wage_amount);
                    }
                }

                return amount;
            },

            /**
             * Gets the highest possible wage amount for the staff user.
             *
             * @returns {Number}
             */

            get_staff_wage_amount: function(){
                var rules = this.settings.staff_rules;
                var user_groups = yootil.user.group_ids();
                var amount = 0;

                for(var a = 0, l = rules.length; a < l; a ++){
                    if(rules[a].groups){
                        for(var g = 0, gl = user_groups.length; g < gl; g ++){
                            if($.inArrayLoose(user_groups[g], rules[a].groups) > -1){
                                amount = parseFloat(rules[a].amount);
                            }
                        }
                    }
                }

                return amount;
            },

            /**
             * Works out the amount of bonus the user should get if bonuses are enabled.
             *
             * @returns {Number}
             */

            get_wage_bonus: function(){
                var data = money.data(yootil.user.id()).get.wages();

                if(this.settings.bonuses_enabled){
                    return ((data.p * parseInt(this.settings.bonus_amount) / 100));
                }

                return 0;
            }

        };

    })().register();
    return money;

})();

$(function(){
    monetary.init();
});

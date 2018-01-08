define([
    'jquery',
    'core/theme-app',
    'core/theme-tpl-tags',
    'core/modules/storage'
    ], function( $, App, TemplateTags, Storage ) {

/**
 * Main DOM elements
 */
var menu = $('#menu').get(0);
var $nav_title = $('#nav-title');
var pull_to_refresh = $('#pull-to-refresh').get(0);
var $progress_bar = $('#progress-bar');
var $toast = $('#toast');
var $toast_message = $('#toast-message');

/**
 * Menu
 */
$("#app-layout").on("click","#menu-button", function(){
    menu.open();
} );

$("#app-layout").on("click","#menu ons-list-item", function(){
    menu.close();
    App.navigate( $(this).data("link") );
} );

/**
 * List items
 */
$("#app-layout").on("click",".archive ons-list-item", function(){
    menu.close();
    App.navigate( $(this).data("link") );
} );

/**
 * Pull to refresh
 */
pull_to_refresh.addEventListener('changestate', function(event) {
    var message = '';
    
    switch ( event.state ) {
        case 'initial':
            message = 'Pull to refresh';
            break;
        case 'preaction':
            message = 'Release';
            break;
        case 'action':
            message = 'Loading...';
            break;
    }

    $(this).html( message );
} );

pull_to_refresh.onAction = function(done) {
    App.refresh( done, done );
};

/**
 * Actions when a screen is displayed
 */
App.on( 'screen:showed', function( current_screen ) {

    menu.close();

    if ( current_screen.screen_type == "list" ) {
        
        //Change nav title
        if ( $nav_title.html() != current_screen.label ) {
            $nav_title.html(current_screen.label);
        }
        
        //Enable pull to refresh for lists
        $(pull_to_refresh).removeAttr('disabled');
        
        //Set scroll position from memory
        var scroll_pos = Storage.get( 'scroll-pos', current_screen.component_id );
        if ( scroll_pos !== null ) {
            set_scroll_pos( scroll_pos );
        } else {
            scroll_top();
        }
        
    } else {
        //Disable pull to refresh if not a list
        $(pull_to_refresh).attr('disabled','disabled');
        
        //Scroll position
        scroll_top();
    }

    if (current_screen.screen_type=="page") {
        //Change nav title
        if ( $nav_title.html() != '' ) {
            $nav_title.html('');
        }
    }

});

/**
 * Actions when we leave a screen
 */
App.on( 'screen:leave', function( current_screen, queried_screen ) {
    //Memorize scroll position:
    if ( current_screen.screen_type == 'list' ) {
        Storage.set( 'scroll-pos', current_screen.component_id, $('#page1 .page__content').scrollTop() );
    }
} );

/**
 * Actions on app refresh
 */
App.on('refresh:start',function(){
    $progress_bar.show();
});
     
App.on('refresh:end',function(result){
    $progress_bar.hide();
    
    scroll_top();
	Storage.clear( 'scroll-pos' );
    
    if ( result.ok ) {
        show_message("Content updated successfully");
    }else{
        show_message(result.message);
    }
});

/**
 * Messages on error and network events
 */
App.on('error',function(error){
    show_message(error.message);
});

App.on('network:online', function(event){
    var ns = TemplateTags.getNetworkState(true);
    show_message(ns);
});

App.on( 'network:offline', function(event){
    var ns = TemplateTags.getNetworkState(true);
    show_message(ns);
});

/**
 * Button "get more posts"
 */
$( '#app-layout' ).on( 'click', '.get-more', function( e ) {
    e.preventDefault();

    var $this = $( this );

    var text_memory = $this.text();
    $this.attr( 'disabled', 'disabled' ).text( 'Loading...' );

    $progress_bar.show();

    App.getMoreComponentItems( 
        function() {
            $this.removeAttr( 'disabled' );
            $progress_bar.hide();
        },
        function( error, get_more_link_data ) {
            $this.removeAttr( 'disabled' ).text( text_memory );
            $progress_bar.hide();
        }
    );
} );

/**
 * Functions
 */
function show_message( message ) {
    $toast_message.text( message );    
    $toast.show();
    setTimeout( hide_message, 3000 );
}

function hide_message() {
    $toast_message.text( '' );    
    $toast.hide();
}

function set_scroll_pos(scroll_pos) {
    $('#page1 .page__content').scrollTop(scroll_pos);
}

function scroll_top() {
    set_scroll_pos(0);
}

});

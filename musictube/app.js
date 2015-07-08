var app = angular.module('YoutubePlayer', ['ngMaterial']);
// Run
function AppController($scope) {
    /* Logic goes here */
}
app.run(function () {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});
// Config
app.config(function ($httpProvider, $mdThemingProvider, $mdIconProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $mdThemingProvider.theme('altTheme')
        .primaryPalette('green')
        .accentPalette('purple');

    $mdIconProvider
        .icon('share-arrow', 'img/icons/share-arrow.svg', 24)
        .icon('upload', 'img/icons/upload.svg', 24)
        .icon('copy', 'img/icons/copy.svg', 24)
        .icon('print', 'img/icons/print.svg', 24)
        .icon('hangout', 'img/icons/hangout.svg', 24)
        .icon('mail', 'img/icons/mail.svg', 24)
        .icon('message', 'img/icons/message.svg', 24)
        .icon('copy2', 'img/icons/copy2.svg', 24)
        .icon('facebook', 'img/icons/facebook.svg', 24)
        .icon('twitter', 'img/icons/twitter.svg', 24);
});
// Service
// use factory in the future to avoid scope conflicts.
app.service('VideosService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {
    var service = this;
    var hight = '400';
    var width = '100%';
    var youtube = {
        ready: false,
        player: null,
        playerId: null,
        videoId: null,
        videoTitle: null,
        playerHeight: hight,
        playerWidth: width,
        state: 'stopped'
    };
    var results = [];
    var related = [];
    var upcoming = [
        {id: 'kRJuY6ZDLPo', title: 'La Roux - In for the Kill (Twelves Remix)'},
        {id: '45YSGFctLws', title: 'Shout Out Louds - Illusions'},
        {id: 'ktoaj1IpTbw', title: 'CHVRCHES - Gun'},
        {id: '8Zh0tY2NfLs', title: 'N.E.R.D. ft. Nelly Furtado - Hot N\' Fun (Boys Noize Remix) HQ'},
        {id: 'zwJPcRtbzDk', title: 'Daft Punk - Human After All (SebastiAn Remix)'},
        {id: 'sEwM6ERq0gc', title: 'HAIM - Forever (Official Music Video)'},
        {id: 'fTK4XTvZWmk', title: 'Housse De Racket â˜â˜€â˜ Apocalypso'},
        {id: 'fvUaK_MWkDg', title: 'Yeasayer - Ambling Alp (Offical Video)'}
    ];
    var history = [
        {id: 'XKa7Ywiv734', title: '[OFFICIAL HD] Daft Punk - Give Life Back To Music (feat. Nile Rodgers)'}
    ];
// use upcoming events to get related videos;
    var len = upcoming.length;
    $window.onYouTubeIframeAPIReady = function () {
        $log.info('Youtube API is ready');
        youtube.ready = true;
        service.bindPlayer('placeholder');
        service.loadPlayer();
        $rootScope.$apply();
    };
    function onYoutubeReady(event) {
        $log.info('YouTube Player is ready');
        youtube.player.cueVideoById(history[0].id);
        youtube.videoId = history[0].id;
        youtube.videoTitle = history[0].title;
    }

    function onYoutubeStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING) {
            youtube.state = 'playing';
        } else if (event.data == YT.PlayerState.PAUSED) {
            youtube.state = 'paused';
        } else if (event.data == YT.PlayerState.ENDED) {
            youtube.state = 'ended';
            service.launchPlayer(upcoming[0].id, upcoming[0].title);
            service.archiveVideo(upcoming[0].id, upcoming[0].title);
            service.deleteVideo(upcoming, upcoming[0].id);
        }
        $rootScope.$apply();
    }

    this.bindPlayer = function (elementId) {
        $log.info('Binding to ' + elementId);
        youtube.playerId = elementId;
    };
    this.createPlayer = function () {
        $log.info('Creating a new Youtube player for DOM id ' + youtube.playerId + ' and video ' + youtube.videoId);
        return new YT.Player(youtube.playerId, {
            height: youtube.playerHeight,
            width: youtube.playerWidth,
            playerVars: {
                rel: 0,
                showinfo: 0
            },
            events: {
                'onReady': onYoutubeReady,
                'onStateChange': onYoutubeStateChange
            }
        });
    };
    this.loadPlayer = function () {
        if (youtube.ready && youtube.playerId) {
            if (youtube.player) {
                youtube.player.destroy();
            }
            youtube.player = service.createPlayer();
        }
    };
    this.launchPlayer = function (id, title) {
        youtube.player.loadVideoById(id);
        youtube.videoId = id;
        youtube.videoTitle = title;
        return youtube;
    }

    this.listResults = function (data) {
        results.length = 0;
        for (var i = data.items.length - 1; i >= 0; i--) {
            results.push({
                id: data.items[i].id.videoId,
                title: data.items[i].snippet.title,
                description: data.items[i].snippet.description,
                thumbnail: (function () {
                    this.level4 = (((data || {}).items[i] || {}).snippet || {}).thumbnails;
                    console.log('this is the key' + Object.keys(level4));
                    if (Object.keys(level4) == 'medium') {
                        return (data.items[i].snippet.thumbnails.medium.url);
                    } else if (Object.keys(level4) == 'high') {
                        return (data.items[i].snippet.thumbnails.high.url);
                    } else if (Object.keys(level4) == 'default') {
                        return (data.items[i].snippet.thumbnails.default.url);
                    }
                })(),
                author: data.items[i].snippet.channelTitle
            });
        }
        return results;
    }
    this.listRelated = function (data) {
        related.lenth = 0;
        for (var i = data.items.length - 1; i >= 0; i--) {
            related.push({
                id: data.items[i].id.videoId,
                title: data.items[i].snippet.title,
                description: data.items[i].snippet.description,
                thumbnail: (function () {
                    this.level4 = (((data || {}).items[i] || {}).snippet || {}).thumbnails;
                    console.log('this is the key of related ' + Object.keys(level4));
                    if (Object.keys(level4) == 'default') {
                        return (data.items[i].snippet.thumbnails.default.url);
                    } else if (Object.keys(level4) == 'medium') {
                        return (data.items[i].snippet.thumbnails.medium.url);
                    } else if (Object.keys(level4) == 'high') {
                        return (data.items[i].snippet.thumbnails.high.url);

                    }
                })(),
                author: data.items[i].snippet.channelTitle
            });
        }

        //check if array is overpopulated Service multiple instances.
        var len = related.length;
        if (len > 8) {
            related.splice(0, 8);
        }
        return related;
    }

    this.queueVideo = function (id, title) {

        upcoming.push({
            id: id,
            title: title
        });
        return upcoming;
    };

    this.archiveVideo = function (id, title) {
        history.unshift({
            id: id,
            title: title
        });
        return history;
    };
    this.deleteVideo = function (list, id) {
        for (var i = list.length - 1; i >= 0; i--) {
            if (list[i].id === id) {
                list.splice(i, 1);
                break;
            }
        }
    };

    this.getYoutube = function () {
        return youtube;
    };

    this.getResults = function () {
        return results;
    };

    this.getUpcoming = function () {
        return upcoming;
    };

    this.getHistory = function () {
        return history;
    };
    this.getRelated = function () {
        return related;
    };
}]);

// Controller

app.controller('VideosController', function ($scope, $http, $log, VideosService) {
    init();
    function init() {
        $scope.youtube = VideosService.getYoutube();
        $scope.results = VideosService.getResults();
        $scope.upcoming = VideosService.getUpcoming();
        $scope.history = VideosService.getHistory();
        $scope.related = VideosService.getRelated();

        $scope.playlist = true;
    }

    $scope.launch = function (id, title) {
        VideosService.launchPlayer(id, title);
        VideosService.archiveVideo(id, title);
        VideosService.deleteVideo($scope.upcoming, id);
        $log.info('Launched id:' + id + ' and title:' + title);
    };
    $scope.queue = function (id, title) {

        VideosService.queueVideo(id, title);
        VideosService.deleteVideo($scope.history, id);
        $log.info('Queued id:' + id + ' and title:' + title);
    };
    $scope.delete = function (list, id) {
        VideosService.deleteVideo(list, id);
    };
    function checkGeolocation() {
        if (navigator.geolocation) {
            refresh();
        } else {
            $('#results')[0].innerHTML = "<p>Your browser doesn't support geolocation.<br /></p>";
        }
    }

    $scope.resultsLength = function () {
        return VideosService.getResults().length;
    }
    $scope.relatedLength = function () {
        return VideosService.getRelated().length;
    }

    function getDistance(position) {
        locationQuery = position.coords.latitude.toString() + ',' + position.coords.longitude.toString();
        console.log(locationQuery);
    }

    function handleError(error) {
        alert(error.message);
    }

    function refresh() {
        navigator.geolocation.getCurrentPosition(getDistance, handleError);
    }

    $(document).ready(function () {
        checkGeolocation();
    });


    $scope.search = function (query, windowWidth) {
        this.videoSize = 'default';
        if (windowWidth < 400) {
            videoSize = 'default';
        } else if (windowWidth > 400 && windowWidth <= 900) {
            videoSize = 'medium';
        } else if (windowWidth > 900) {
            videoSize = 'high';
        }
        console.log(videoSize);


        $http.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: 'AIzaSyCqD7uuoSEXa8CtbHfW70B4MtXbS6YjZr8',
                type: 'video',
                maxResults: '8',
                videoEmbeddable: true,
                //videoEmbeddable: any(return all videos, embeddable or not), true(only retrieve embeddable videos)
                //videoDefinition: (any, high, standard)
                //video:(Dimension:2d,3d,any)
                //order:(date, rating,relevance, title, videoCount,viewCount)
                //videoDuration: (any, long medium, short)
                //videoSyndicated:any(returns all vidoes, syndicated or not),true(Only retrieve vidoes that can be played on youtube)
                //videoType:any(any), episode(only episode), movie(only movies),
                location: locationQuery,
                locationRadius: '21mi',
                //publishedAfter: stuff,
                //publishedBefore: stuff,
                part: 'snippet',
                relevanceLanguage: 'en',
                fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/' + videoSize + ',items/snippet/channelTitle',
                q: this.query
                //relatedToVideoId:relatedToVideo
            }
        })

            .success(function (data) {
                console.log('mainvidoes' + VideosService.listResults(data));

                $log.info(data);
            })
            .error(function () {
                $log.info('Search error');
            });
    };

    $scope.loadNewFilter = function () {
        $scope.filter = [1, 2, 3];
        $scope.$apply();
    }


    $scope.searchRelated = function (id, windowWidth) {

        this.videoSize = 'default';
        if (windowWidth < 400) {
            videoSize = 'default';
        } else if (windowWidth > 400 && windowWidth <= 900) {
            videoSize = 'medium';
        } else if (windowWidth > 900) {
            videoSize = 'high';
        }
        $http.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: 'AIzaSyCqD7uuoSEXa8CtbHfW70B4MtXbS6YjZr8',
                type: 'video',
                maxResults: '8',
                videoEmbeddable: true,
                //order:date, rating,relevance, title, videoCount,viewCount
                location: locationQuery,
                locationRadius: '21mi',
                //publishedAfter: stuff,
                //publishedBefore: stuff,
                part: 'snippet',
                relevanceLanguage: 'en',
                fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/' + videoSize + ',items/snippet/channelTitle',
                q: this.query,
                relatedToVideoId: id
            }
        })
            .success(function (data, videoSize) {
                VideosService.listRelated(data, videoSize);
                $log.info(data, videoSize);
            })
            .error(function () {
                $log.info('Search error');
            });
    };
    $scope.tabulate = function (state) {
        $scope.playlist = state;
    }

});
app.directive('resizable', function ($window) {
    return function ($scope) {
        $scope.initializeWindowSize = function () {
            $scope.windowHeight = $window.innerHeight;
            $scope.windowWidth = $window.innerWidth;
        };
        angular.element($window).bind("resize", function () {
            $scope.initializeWindowSize();
            $scope.$apply();
        });
        $scope.initializeWindowSize();
    }
});


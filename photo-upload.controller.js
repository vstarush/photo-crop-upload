(function() {

'use strict';

angular.module('appName')
.controller('photoUploadController', ['$scope', '$timeout', '$state', '$window','$sce','photoUploadFactory','$stateParams','popUpManager', function($scope, $timeout, $state, $window, $sce, photoUploadFactory, $stateParams, popUpManager) {
    $scope.photo = {
        link:'',
        text:'',
        html:'',
        error:false
    };
    var cropper = undefined,
    	options = {
            imageBox: '.imageBox',
            thumbBox: '.thumbBox',
            spinner: '.spinner',
            imgSrc: '',
            ratio: undefined
        }
    $scope.photoLoadingProcess = false;
        
    if ($stateParams.recruiterIcon) {
	    $('.userIconChoosePhoto i').removeClass('fa fa-user');
	    $('.userIconChoosePhoto i').addClass('fa fa-university');
	    $('.userIconChoosePhoto').css('left','55px');
    }

    $scope.loadPhotoFromFile  = function(event) {
    	var files = event.target.files,
        	reader = new FileReader();
        $scope.photoLoadingProcess = true;

        if (event.target.files.length == 0) return;
		
		setTimeout(function() {
          $scope.$apply($scope.photoLoadingProcess);  
        }, 0);
        
        reader.onload = function(event){
            var the_url = event.target.result,
            	loadedImage = new Image();
            
            options.imgSrc = the_url;
			loadedImage.src = the_url;
			
			loadedImage.onload = function() {
				var imageWidth = this.width,
					imageHeight = this.height,
					el = document.querySelector(options.imageBox),
					boxWidth = el.clientWidth,
					boxHeight = el.clientHeight;
				
				if (imageWidth > imageHeight) {
					options.ratio = boxWidth/imageWidth;
				}
				else {
					options.ratio = boxHeight/imageHeight;
				}
				cropper = new cropbox(options);
				$scope.initSlider(options.ratio);
			};
        }
        reader.readAsDataURL(files[0]);
        files = [];
    };

    $scope.prevPhotoLink = photoUploadFactory.currentFactory().getCurrentPhoto().link;
    
    $scope.cropCancel = function() {
        var imgUrl = $scope.prevPhotoLink,
        	el = document.querySelector(options.imageBox);
        
        $scope.photo.link = imgUrl;
        $scope.photo.html =  '';
        el.removeAttribute('style');
        $scope.photoLoadingProcess = false;
    }
    
    $scope.cropImage = function() {
        var imgUrl = cropper.getDataURL(),
        	popupMessage = {
			header:'',
			body:'Your photo was successfully uploaded!',
			btnOneName:"OK"
		};
        
        $scope.photo.link = imgUrl;
        $scope.photo.html =  '<img class="thumbBox fullsize" src="'+imgUrl+'" ng-cloak>';
        photoUploadFactory.currentFactory().setCurrentPhoto({
            link:imgUrl
        });
        $scope.prevPhotoLink = photoUploadFactory.currentFactory().getCurrentPhoto().link;
        $scope.photoLoadingProcess = false;
        publishPhotoAndResume();
		popUpManager.popupModal(popupMessage);
    };
	
    var publishPhotoAndResume = function() {
		photoUploadFactory.currentFactory().publishPhoto().then(
            function(result){
                if (result == undefined) return;

                $scope.photo.link = result;
                $scope.photo.html =  '<img class="thumbBox fullsize" src="'+result+'" ng-cloak>';
                photoUploadFactory.currentFactory().setCurrentPhoto({
                    link:result
                });
                $scope.prevPhotoLink = photoUploadFactory.currentFactory().getCurrentPhoto().link;
	            photoUploadFactory.currentFactory().publishResume(true);
            },
            function(err) {}
        ); 
	}

    $scope.pushButton = function(buttonID) {
         document.getElementById(buttonID).click();
    };

     $scope.isFilled = function(textToCheck) {
        return textToCheck.toString().length > 2;
    };
    
    $scope.checkForCurrentPhoto = function() {
        if (photoUploadFactory.currentFactory().getCurrentPhoto().link != undefined && photoUploadFactory.currentFactory().getCurrentPhoto().link.length>2){
            $scope.photo.link = photoUploadFactory.currentFactory().getCurrentPhoto().link;
            $scope.photo.html = '<img id="photoChoose" src="'+photoUploadFactory.currentFactory().getCurrentPhoto().link+'" ng-cloak>';
        }
    };
    
    $scope.initSlider = function(startPoint) {
		    var max = startPoint*7,
		    	min = startPoint-(startPoint/1.5),
		    	step = startPoint/10,
		    	value = startPoint;
		    
		    $( '#slider' ).slider({
		    max: max,
		    min: min,
		    step: step,
		    value: value,
			slide: function( event, ui ) {			
				cropper.zoom(ui.value);
           }
	    }); 
    }
    
    $scope.checkForCurrentPhoto();
    
    $scope.goBack = function() {
        $window.history.back();
    };
    
    $scope.init = function() {
         Webcam.set({
	        width: 400,
			height: 300,
			// device capture size
			dest_width: 533,
			dest_height: 400,
			// final cropped size
			crop_width: 400,
			crop_height: 400,
			// format and quality
			image_format: 'png',
			jpeg_quality: 90
	    });
    };

    $scope.init();
    $scope.cameraMode = false;

    $scope.openCamera = function() {
         $scope.cameraMode = true;           
        Webcam.attach('#cameraView');
    }

    $scope.closeCamera = function(){
        $scope.cameraMode = false;
         Webcam.reset('#cameraView');
         $scope.checkForCurrentPhoto();
    }

    $scope.takePhoto = function(){
        Webcam.snap( function(data_uri) {
            	$scope.photo.link = data_uri;
                $scope.photo.html =  '<img class="thumbBox fullsize" src="'+data_uri+'" ng-cloak>';
                photoUploadFactory.currentFactory().setCurrentPhoto({
                    link:data_uri
                });
                $scope.closeCamera();
                publishPhotoAndResume();
                var popupMessage = {
                    header:'',
                    body:'Your photo was successfully saved!',
                    btnOneName:"OK"
                }
                popUpManager.popupModal(popupMessage);
                $scope.goBack();
            });
    }}]).
	factory('photoUploadFactory', function() {
	    var currentFactory = "";
	    return {
		    setCurrentFactory: function(factory) {
			    currentFactory = factory;
		    },
		    currentFactory: function() {
			    return currentFactory;
		    }
		};
	});
})();

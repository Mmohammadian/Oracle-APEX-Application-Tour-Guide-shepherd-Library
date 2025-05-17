function addTourStyles() {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        .stp-highlight { 
            border: 3px solid #2e7d32 !important;
            background-color: rgba(255, 255, 255, 0.8) !important;
            color:black !important;
            box-sizing: border-box; 
            z-index: 1001 !important;
            position: relative; 
            outline: 2px solid #2e7d32;
        }
        .tour-overlay { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0, 0, 0, 0.5); 
            z-index: 1000; 
            pointer-events: auto; 
        }
        body.tour-active *:not(.stp-highlight):not(.shepherd-element):not(.shepherd-element *) { 
            pointer-events: none; 
        }
    `;
    document.head.appendChild(style);
}

function getDataForTour(pClassName) {
    return new Promise((resolve, reject) => {
        apex.server.process(
            'applicationTour',
            {
                x01: pClassName
            },
            {
                success: function(data) {
                    let result = typeof data === 'string' ? JSON.parse(data.trim()) : data;
                    if (Array.isArray(result) && result.length > 0) {
                        resolve({
                            tour_title: result[0].TOUR_TITLE || 'no title',
                            tour_text: result[0].TOUR_TEXT || 'no description'
                        });
                    } else {
                        resolve({
                            tour_title: 'No title step',
                            tour_text: 'No data Found for' + pClassName
                        });
                    }
                },
                error: function(xhr, status, error) {
                    console.error('error:', error);
                    reject(error);
                }
            }
        );
    });
}

function getStepCount() {
    var uniqueStpClasses = [];
    $('[class*="stp"]').each(function() {
        var stpClass = $(this).attr('class').split(' ').find(cls => cls.includes('stp'));
        if (stpClass && !uniqueStpClasses.includes(stpClass)) {
            uniqueStpClasses.push(stpClass);
        }
    });
    
    uniqueStpClasses.sort((a, b) => {
        var numA = parseInt(a.replace('stp', '')) || 0;
        var numB = parseInt(b.replace('stp', '')) || 0;
        return numA - numB;
    });
    return uniqueStpClasses.length;
}

function addStep(tour, pStepName, pStepTitle, pStepText, pAttachToElement, pPosition, index, totalSteps) {
    const isStp1 = $(pAttachToElement).hasClass('stp1');
    const isLastStep = index === totalSteps - 1;

    const buttons = [];

    if (!isLastStep) {
        buttons.push({
            text: 'Close',
            classes: 'shepherd-button-secondary',
            action: function() { return tour.cancel(); }
        });
    }

    if (!isStp1) {
        buttons.push({
            text: 'pervious',
            classes: 'shepherd-button-secondary',
            action: function() { return tour.back(); },
            disabled: index === 0
        });
    }

    buttons.push({
        text: isLastStep ? 'end' : 'next',
        action: tour.next,
        classes: 'shepherd-button-example-primary'
    });

    tour.addStep(pStepName, {
        title: pStepTitle,
        text: pStepText,
        attachTo: {
            element: pAttachToElement[0],
            on: pPosition
        },
        buttons: buttons,
        when: {
            show: function() {
                $(pAttachToElement).addClass('stp-highlight');
                $('body').addClass('tour-active');
            },
            hide: function() {
                $(pAttachToElement).removeClass('stp-highlight');
                $('body').removeClass('tour-active');
            }
        }
    });
}

function startTour(pCssClass, pAppID, pPageId) {
    const classCount = getStepCount();
    addTourStyles();
    var overlay = $('<div>').addClass('tour-overlay').appendTo('body');
    console.log('add overlay');

    var tour = new Shepherd.Tour({
        defaults: {
            classes: pCssClass,
            scrollTo: false
        }
    });

    tour.on('complete', function() {
        $('.stp-highlight').removeClass('stp-highlight');
        overlay.remove();
        $('body').removeClass('tour-active');
    });
    tour.on('cancel', function() {
        $('.stp-highlight').removeClass('stp-highlight');
        overlay.remove();
        $('body').removeClass('tour-active');
    });

    
    var uniqueStpClasses = [];
    $('[class*="stp"]').each(function() {
        var stpClass = $(this).attr('class').split(' ').find(cls => cls.includes('stp'));
        if (stpClass && !uniqueStpClasses.includes(stpClass)) {
            uniqueStpClasses.push(stpClass);
        }
    });

    
    uniqueStpClasses.sort((a, b) => {
        var numA = parseInt(a.replace('stp', '')) || 0;
        var numB = parseInt(b.replace('stp', '')) || 0;
        return numA - numB;
    });

    
    var stpElements = uniqueStpClasses.map(cls => $('.' + cls).first()[0]).filter(el => el);

    if (stpElements.length === 0) {
        overlay.remove();
        return;
    }

    var tourDataPromises = stpElements.map((element, index) => {
        var className = $(element).attr('class').split(' ').find(cls => cls.includes('stp')) || 'stp' + (index + 1);
        return getDataForTour(className, pAppID, pPageId).then(data => ({
            element: $(element),
            data: data,
            index: index
        })).catch(error => {
            return {
                element: $(element),
                data: { tour_title: 'no title step', tour_text: 'error' },
                index: index
            };
        });
    });

    Promise.all(tourDataPromises)
        .then(results => {
            results.forEach(({ element, data, index }) => {
                var stepId = 'step' + (index + 1);
                var stepTitle = data.tour_title || 'step ' + (index + 1);
                var stepText = data.tour_text || 'step description ' + (index + 1);
                var position = element.data('position') || 'bottom';
                addStep(tour, stepId, stepTitle, stepText, element, position, index, uniqueStpClasses.length);
            });

            if (uniqueStpClasses.length > 0) {
                tour.start();
            } else {
                overlay.remove();
            }
        })
        .catch(error => {
            overlay.remove();
        });
}

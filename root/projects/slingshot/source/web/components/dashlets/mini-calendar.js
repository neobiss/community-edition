/**
 * Copyright (C) 2005-2010 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Mini Calendar component.
 * 
 * @namespace Alfresco.dashlet
 * @class Alfresco.dashlet.MiniCalendar
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom;

   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML;

   var DAY_MS = 24*60*60*1000; 
   var days = new Object();
   days["SU"]=0;
   days["MO"]=1;
   days["TU"]=2;
   days["WE"]=3;
   days["TH"]=4;
   days["FR"]=5;
   days["SA"]=6;
   
   Alfresco.dashlet.MiniCalendar = function MiniCalendar_constructor(htmlId)
   {
      return Alfresco.dashlet.MiniCalendar.superclass.constructor.call(this, "Alfresco.dashlet.MiniCalendar", htmlId, ["calendar"]);
   };
   
   YAHOO.extend(Alfresco.dashlet.MiniCalendar, Alfresco.component.Base,
   {
      /**
       * Fired by YUI when parent element is available for scripting.
       * Initialises components, including YUI widgets.
       * 
       * @method onReady
       */ 
      onReady: function MiniCalendar_onReady()
      {
         /*
          * Separate the (initial) rendering of the calendar from the data
          * loading. If for some reason the data fails to load, the calendar
          * will still display.
          */
         var uriEvents = Alfresco.constants.PROXY_URI + "calendar/eventList?site=" + this.options.siteId;
         
         var callback = 
         {
            success: this.onSuccess,
            failure: this.onFailure,
            scope: this
         };
         
         YAHOO.util.Connect.asyncRequest('GET', uriEvents, callback);
      },

      /**
       * Event handler that gets fired when the calendar data for the current
       * site. is loaded successfully.
       * 
       * @method onSuccess
       * @param o
       *            {object} Result of AJAX call
       */
      onSuccess: function MiniCalendar_onSuccess(o)
      {
         var noEventHTML = '<div class="detail-list-item first-item last-item"><span>' + this.msg("label.no-items") + '</span></div>';
         var eventHTML = '';
         var hasEvents = false;
         try 
         {
            var now = new Date();
            now.setHours(0, 0, 0, 0);

            var eventList = YAHOO.lang.JSON.parse(o.responseText);
            eventList = this.getAllEvents(eventList);

            var resultEvents = [];
            for (var i = 0; i < eventList.length; i++)
            {
               var item = eventList[i];
               if (item.recurrenceRule != null)
               {
                  var nextEventDays = this.getNextEventStartDates(item, now);
                  if (nextEventDays.length > 0)
                  {
                     var stringDate = Alfresco.util.formatDate(nextEventDays[0], "m/d/yyyy");
                  }
                  item.from = stringDate;
                  item.to = stringDate;
                  resultEvents.push(item);
               }
               else
               {
                  if (this.cloneDate(item.from) >= now)
                  {
                     resultEvents.push(item);
                  }
               }
            }

            var map = new Object();
            for (var i = 0; i < resultEvents.length; i++)
            {
               var item = resultEvents[i];
               if (map[item.from] == null)
               {
                  var list = [];
                  list.push(item);
                  map[item.from] = list; 
               }
               else
               {
                  map[item.from].push(item);
               }
            }

            for (var key in map)
            {
               eventHTML += this.renderDay(this.cloneDate(key), map);
            }
         }
         catch (e)
         {
            // Do nothing
            eventHTML = "Could not load calendar data";
         }
         Dom.get(this.id + "-eventsContainer").innerHTML = resultEvents.length > 0 ? eventHTML : noEventHTML;
      },

      /**
       * Render an event
       * 
       * @method renderDay
       * @param data
       *            {Date} Date to render
       * @param eventData
       *            {object} Event data
       */
      renderDay: function MiniCalendar_renderDay(date, eventData)
      {
         var theStupidDate = Alfresco.util.formatDate(date, "m/d/yyyy");
         var theDate = Alfresco.util.toISO8601(date,
         {
            selector: "date"
         });
         var events = eventData[theStupidDate];
         var html = "", item;
         if (events && events.length > 0)
         {
            var title = Alfresco.util.formatDate(date, "ddd, d mmm yyyy");
            var url = Alfresco.constants.URL_CONTEXT + "page/site/" + this.siteId + "/calendar?view=day&date=" + theDate;
            html += '<div class="detail-list-item">';
            html += '<div class="icon"><img src="' + Alfresco.constants.URL_CONTEXT + 'components/calendar/images/calendar-16.png" alt="day" /></div>';
            html += '<div class="details2"><h4><a href="'+url+'" class="theme-color-1">' + title + '</a></h4>';
            for (var i = 0, ii = events.length; i < ii; i++)
            {
               item = events[i];
               // if start and end match it is an allday or multiday event
               var itemName = $html(item.name);
               if (item.recurrenceRule != null)
               {
                  itemName += " (Recurring)";
               }
               if (item.start === item.end)
               {
                  html += '<div><span><a href="' + url + '">' + itemName + '</a></span></div>';                  
               }
               else
               {
                  html += '<div><span>' + item.start + ' <a href="' + url + '">' + itemName + '</a></span></div>';                  
               }
            }
            html += '</div></div>';
         }
         return html;   
      },

     getAllEvents: function(eventList)
     {
        var result = [];
        for (var key in eventList)
        {
           var events = eventList[key];
           if (events && events.length > 0)
           {
              for (var i = 0, ii = events.length; i < ii; i++)
             {
                result.push(events[i]);
             }
           }
        }
        return result;
     },

      /**
       * Event handler that gets fired when the calendar data for the current
       * site. fails to load. Displays an alert informing the user that the
       * data didn't load.
       * 
       * @method onFailure
       * @param e
       *            {object} DomEvent
       */
      onFailure: function(o)
      {
         Dom.get(this.id + "-eventsContainer").innerHTML = "Failed to load calendar data.";
      },
      /**
       * Gets a custom message
       * 
       * @method _msg
       * @param messageId
       *            {string} The messageId to retrieve
       * @return {string} The custom message
       * @private
       */
      _msg: function Activities__msg(messageId)
      {
         return Alfresco.util.message.call(this, messageId, "Alfresco.MiniCalendar", Array.prototype.slice.call(arguments).slice(1));
      },
      /**
       * Set messages for this component
       * 
       * @method setMessages
       * @param obj
       *            {object} Object literal specifying a set of messages
       */
      setMessages: function setMessages(obj)
      {
         Alfresco.util.addMessages(obj, this.name);
         return this;
      },      

      /**
       * Return next occurence of provided event after currentDate.
       */
      getNextEventStartDates: function getNextEventStartDates(event, currentDate)
      {       
          var rubeResult = [];
          var result = [];
          var recurrenceRule = event.recurrenceRule;
      
          var evStart = this.cloneDate(event.from);
      
          // If event starts in future, then start search from its start date
          if (evStart >= currentDate)
          {
             currentDate = evStart;
          }
          var parts = recurrenceRule.split(";");
          var eventParam = new Object();
      
          for (var i = 0; i < parts.length; i++)
          {
             var part = parts[i].split("=");
             eventParam[part[0]]= part[1];
          }
      
          var endDate = new Date();
          endDate.setTime(currentDate.getTime());
          var needCycle = true;
      
          while(needCycle)
          {
             // Get all events between currentDate and currentDate + event interval.
             // There must be at least one event.
             if (eventParam['FREQ']=="WEEKLY")
             {
                endDate.setTime(endDate.getTime() + eventParam['INTERVAL'] * DAY_MS * 7);
                rubeResult =  this.resolveStartDateWeekly(event, eventParam, currentDate, endDate);
             }
             else  if (eventParam['FREQ']=="DAILY")
             {
                endDate.setTime(endDate.getTime() + eventParam['INTERVAL'] * DAY_MS);
                rubeResult =  this.resolveStartDaily(event, eventParam, currentDate, endDate);
             }
             else  if (eventParam['FREQ']=="MONTHLY")
             {
                endDate.setMonth(endDate.getMonth() + eventParam['INTERVAL'] * 1);
                rubeResult =  this.resolveStartMonthly(event, eventParam, currentDate, endDate);
             }
      
             if (rubeResult.length > 0)
             {
                // sort rubeResult
                for (var i = 0; i < rubeResult.length -1; i++)
                {
                   for(var j = i + 1; j < rubeResult.length; j++)
                   {
                      if(rubeResult[i] > rubeResult[j])
                      {
                         var tmp = rubeResult[i];
                         rubeResult[i] = rubeResult[j];
                         rubeResult[j] = tmp;
                      }
                   }
                }
      
                // Find first reccurent rule that not ignored
                if (event.ignoreEvents.length > 0)
                {
                   for (var i = 0; i < rubeResult.length; i++)
                   {
                      var isIgnored = false;
                      for(var j = 0; j < event.ignoreEvents.length; j++)
                      {
                         if (Alfresco.util.formatDate(rubeResult[i], "m/d/yyyy") == event.ignoreEvents[j])
                         {
                            isIgnored = true;
                            break;
                         }
                      }
                      if (!isIgnored)
                      {
                         result.push(rubeResult[i]);
                         break;
                      }
                   }
                }
                else
                {
                   result.push(rubeResult[0]);
                }
      
                if (result.length == 1)
                {
                   needCycle = false;
                }
                else
                {
                   currentDate = endDate;
                }
             }
             else
             {
                needCycle = false;
             }
          }
          return result;
      },

      /**
       * Return all days between currentDate and endDate when weekly event
       * occurs.
       * 
       * 
       * @method resolveStartDatesWeekly
       * @param ev
       *            {Object} object that represent weekly event
       * @eventParam Map of event parameters taken from RRULE
       * @param currentDate
       *            {Date} first day that event may occur.
       * @param endDate
       *            {Date} last day that event may occur.
       * 
       * @return {Array} Array that contains days beetwing currentDate and
       *         endDate on wich weekly event occurs
       */
      resolveStartDateWeekly: function resolveStartDateWeekly (ev, eventParam, currentDate, endDate)
      {
         var result = [];
      
         var eventDays = eventParam['BYDAY'].split(",");
         var interval = eventParam['INTERVAL'];
         var lastEventDay = this.getLastEventDay(ev, currentDate, endDate);
      
         if (lastEventDay == -1)
         {
            return result;
         }
      
         var eventStart = this.cloneDate(ev.from);
      
         // Add as much full event cycles as need
         if (eventStart.getTime() < currentDate.getTime())
         {
            var duration = Math.floor((currentDate.getTime() - eventStart.getTime())/(interval * 7 * DAY_MS));
            var offset = duration * DAY_MS;
            eventStart.setTime(eventStart.getTime() + offset * interval * 7);
      
         }
         if (eventStart.getTime() > endDate.getTime())
         {
            return result;
         }
      
         var eventStartDay = eventStart.getDay();
         eventStart.setTime(eventStart.getTime() - eventStartDay * DAY_MS);
      
         var eventStartDays   = [];
         for(var i = 0; i < eventDays.length; i++)
         {
            dayOfWeek = days[eventDays[i]];
            eventStartDays.push(dayOfWeek);
         }
      
         for (var i = 0; i < eventStartDays.length; i++)
         {
            var eventDate = new Date();   
            eventDate.setTime(eventStart.getTime() + eventStartDays[i] * DAY_MS);
      
            while (eventDate.getTime() - lastEventDay.getTime() < DAY_MS)
            {
               if (eventDate.getTime() >= currentDate.getTime() && eventDate.getTime() >= this.cloneDate(ev.from).getTime())
               {
                  var dateToAdd = new Date();
                  dateToAdd.setTime(eventDate.getTime())
                  result.push(dateToAdd);
               }
               eventDate.setTime(eventDate.getTime() + 7 * interval * DAY_MS);
            }
         }
         return result;
      },
      
      /**
       * Return all days between currentDate and endDate when daily event
       * occurs.
       * 
       * 
       * @method resolveStartDaily
       * @param ev
       *            {Object} object that represent daily event
       * @eventParam Map of event parameters taken from RRULE
       * @param currentDate
       *            {Date} first day when event may occur.
       * @param endDate
       *            {Date} last day when event may occur.
       * 
       * @return {Array} Array that contains days beetwing currentDate and
       *         endDate on wich daily event occurs
       */
      resolveStartDaily: function resolveStartDaily (ev, eventParam, currentDate, endDate)
      {  
         var result = [];
      
         var interval = eventParam['INTERVAL'];
         var lastEventDay = this.getLastEventDay(ev, currentDate, endDate);
      
         if (lastEventDay == -1)
         {
            return result;
         }
      // --------------------
         var eventStart = this.cloneDate(ev.from);
      
          // Add as much full event cycles as need
         if (eventStart.getTime() < currentDate.getTime())
         {
            var duration = Math.floor((currentDate.getTime() - eventStart.getTime())/(interval * DAY_MS));
            var offset = duration * DAY_MS;
            eventStart.setTime(eventStart.getTime() + offset * interval);
            if (eventStart.getTime() < currentDate.getTime())
            {
               eventStart.setTime(eventStart.getTime() + interval * DAY_MS);
            }
         }
      
         if (eventStart.getTime() > endDate.getTime())
         {
            return result;
         }
         var eventDate = eventStart;
      // -------------------
         while (eventDate.getTime() - lastEventDay.getTime() < DAY_MS)
         {
            var dateToAdd = new Date();
            dateToAdd.setTime(eventDate.getTime())
            result.push(dateToAdd);
            eventDate.setTime(eventDate.getTime() + interval * DAY_MS);
         }
      
         return result;
      },
      
      /**
       * Return all days between currentDate and endDate when monthly event
       * occurs.
       * 
       * 
       * @method resolveStartMonthly
       * @param ev
       *            {Object} object that represent monthly event
       * @eventParam Map of event parameters taken from RRULE
       * @param currentDate
       *            {Date} first day when event may occur
       * @param endDate
       *            {Date} last day when event may occur
       * 
       * @return {Array} Array that contains days beetwing currentDate and
       *         endDate on wich monthly event occurs
       */
      resolveStartMonthly: function resolveStartMonthly (ev, eventParam, currentDate, endDate)
      {    
         var result = [];
      
         var interval = eventParam['INTERVAL'];
      
         var eventStart = this.cloneDate(ev.from);
      
         var lastEventDay = this.getLastEventDay(ev, currentDate, endDate);
         if (lastEventDay == -1)
         {
            return result;
         }
      
         var offset = ((currentDate.getFullYear() * 12 + currentDate.getMonth()) - (eventStart.getFullYear() * 12 + eventStart.getMonth())) % interval;
         if (offset > 0)
         {
            var monthToAdd = interval - offset;
            currentDate.setMonth(currentDate.getMonth() + monthToAdd);
         }
      
         var resultDate = currentDate;
         resultDate.setDate(eventStart.getDate());
         if (eventParam['BYDAY'])
         {
            var allowedDayNames = eventParam['BYDAY'].split(",");
            var allowedDays = new Object();
      
            for (var i = 0; i < allowedDayNames.length; i++)
            {
               allowedDays[days[allowedDayNames[i]]] = 1;
            }
      
            var dayInWeek = eventParam['BYSETPOS'] * 1;
      
            currentDate.setDate(1);
      
            while (dayInWeek > 0)
            {
               if (allowedDays[currentDate.getDay()] == 1)
               {
                  dayInWeek--;
               }
      
               if (dayInWeek > 0)
               {
                  currentDate.setDate(currentDate.getDate() + 1);
               }
            }
      
            if (dayInWeek == -1)
            {
               currentDate.setMonth(currentDate.getMonth() + 1);
               currentDate.setTime(currentDate.getTime() - DAY_MS);
      
               while (allowedDays[currentDate.getDay()] == undefined)
               {
                  currentDate.setTime(currentDate.getTime() - DAY_MS);
               }
            }
            resultDate = currentDate;
         }
      
         if (resultDate.getTime() - lastEventDay.getTime() < DAY_MS)
         {
            if (currentDate > resultDate)
            {
               resultDate.setMonth(resultDate.getMonth() + interval);
            }
            result.push(resultDate);
         }
      
         return result;
      },
      
      /**
       * Return last day between currentDate and endDate when event may occur.
       * 
       * 
       * @method getLastEventDay
       * @param ev
       *            {Object} object that represent monthly event
       * @param currentDate
       *            {Date} first day when event may occur.
       * @param endDate
       *            {Date} last day when event may occur.
       * 
       * @return {Date} last day in current month whe event may occur.
       */
      getLastEventDay: function getLastEventDay (ev, currentDate, endDate)
      {
         var lastEventDay = new Date(endDate);
      
         if ((ev.recurrenceLastMeeting) )
         {
            var lastAllowedDay = this.cloneDate(ev.recurrenceLastMeeting);
      
            if (lastAllowedDay.getTime() < currentDate.getTime() || this.cloneDate(ev.from).getTime() > endDate.getTime())
            {
               return -1;
            }
            if ((lastAllowedDay.getTime() < endDate.getTime()))
            {
                lastEventDay = new Date(lastAllowedDay);
            }
         }
      
         return lastEventDay;
      
      },
      
      /**
       * Clone provided date objet
       */
      cloneDate: function cloneDate(date)
      {
          var dateParts = date.split("/");
          return YAHOO.widget.DateMath.getDate(dateParts[2], (dateParts[0] - 1), dateParts[1]);
      }   
   });
})();
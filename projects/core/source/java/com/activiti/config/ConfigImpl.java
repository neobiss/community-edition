package com.activiti.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;

/**
 * Default implementation of the Config interface
 * 
 * @author gavinc
 */
public class ConfigImpl implements Config
{
   private static final Logger logger = Logger.getLogger(ConfigImpl.class);
   
   private Map configElements;
   
   /**
    * Default constructor
    */
   public ConfigImpl()
   {
      this.configElements = new HashMap();
   }
   
   /**
    * @see com.activiti.config.Config#getConfigElement(java.lang.String)
    */
   public ConfigElement getConfigElement(String name)
   {
      return (ConfigElement)this.configElements.get(name);
   }

   /**
    * Adds a config element to the results for the lookup
    * 
    * @param newConfigElement
    */
   public void addConfigElement(ConfigElement newConfigElement)
   {
      // if the config element being added already exists we need to combine it
      String name = newConfigElement.getName();
      if (this.configElements.containsKey(name))
      {
         ConfigElement existing = (ConfigElement)this.configElements.get(name);
         ConfigElement combined = existing.combine(newConfigElement);
         this.configElements.put(name, combined);
         
         if (logger.isDebugEnabled())
            logger.debug("Combined " + newConfigElement + " with " + existing + " to create " + combined);
      }
      else
      {
         this.configElements.put(name, newConfigElement);
         
         if (logger.isDebugEnabled())
            logger.debug("Added " + newConfigElement);
      }
   }
}

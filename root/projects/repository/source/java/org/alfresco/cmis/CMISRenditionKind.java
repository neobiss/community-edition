/*
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
package org.alfresco.cmis;


/**
 * Enumeration of the CMIS Rendition Kinds
 * 
 * @author Stas Sokolovsky
 */
public enum CMISRenditionKind implements EnumLabel
{
    THUMBNAIL("cmis:thumbnail"), 
    WEB_PREVIEW("alf:webpreview"), 
    ICON16("alf:icon16"), 
    ICON32("alf:icon32");

    private String label;

    /**
     * Construct
     * 
     * @param label
     */
    CMISRenditionKind(String label)
    {
        this.label = label;
    }

    /*
     * (non-Javadoc)
     * 
     * @see org.alfresco.cmis.EnumLabel#label()
     */
    public String getLabel()
    {
        return label;
    }

    public static EnumFactory<CMISRenditionKind> FACTORY = new EnumFactory<CMISRenditionKind>(CMISRenditionKind.class);
    
    public static CMISRenditionKind valueOfLabel(String label)
    {
    	for(CMISRenditionKind kind: CMISRenditionKind.values())
    	{
    		if(kind.getLabel().equals(label))
    		{
    			return kind;
    		}
    	}
    	return null;
    }
}

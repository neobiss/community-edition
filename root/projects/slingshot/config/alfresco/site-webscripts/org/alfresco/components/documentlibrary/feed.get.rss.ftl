<#function formatDate date><#return date?datetime("dd MMM yyyy HH:mm:ss 'GMT'Z '('zzz')'")?string("EEE, dd MMM yyyy HH:mm:ss 'GMT'")></#function>
<#function location loc><#return absurl(url.context) + "/page/site/" + loc.site + "/documentlibrary?file=" + loc.file + "&amp;path=" + loc.path?url?url></#function>
<#function displayLocation loc><#return absurl(url.context) + "/page/site/" + loc.site + "/documentlibrary?file=" + loc.file + "&amp;path=" + loc.path></#function>
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
   <title>Alfresco Share - ${msg("feed.filter." + filter!"path")}</title>
   <link>${absurl(url.context)}/</link>
   <description>Alfresco Document List</description>
   <generator>Alfresco Share DocumentLibrary</generator>
<#assign proxyLink=absurl(url.context) + "/proxy/alfresco-feed/">
   <image>
      <title>Alfresco - Documents</title>
      <url>${absurl(url.context)}/themes/default/images/logo.png</url>
      <link>${absurl(url.context)}/</link>
   </image>
<#list items as item>
   <#if item.type == "document">
      <#assign isImage=(item.mimetype="image/gif" || item.mimetype="image/jpeg" || item.mimetype="image/png")>
      <#assign isMP3=(item.mimetype="audio/x-mpeg" || item.mimetype="audio/mpeg")>
   <item>
      <title>${item.displayName?html}</title>
      <description>
         &lt;img src=&quot;${proxyLink + "api/node/" + item.nodeRef?replace("://", "/") + "/content/thumbnails/doclib?c=queue&amp;ph=true"}&quot;&gt;${(item.description)!""?html}&lt;br /&gt;
         ${msg("feed.created", formatDate(item.createdOn), item.createdBy)}&lt;br /&gt;
         ${msg("feed.modified", formatDate(item.modifiedOn), item.modifiedBy)}&lt;br /&gt;
         ${msg("feed.location")}:&#160;&lt;a href="${location(item.location)}"&gt;${displayLocation(item.location)}&lt;/a&gt;
      </description>
      <link>${proxyLink + item.contentUrl}</link>
      <guid isPermaLink="false">${item.nodeRef}</guid>
      <#assign currentLocale=locale />
      <#setting locale="en_US" />
      <pubDate>${formatDate(item.modifiedOn)}</pubDate>
      <#setting locale=currentLocale />
      <#if isMP3><enclosure url="${proxyLink + item.contentUrl}" length="${item.size}" type="audio/mpeg" /></#if>
   </item>
   </#if>
</#list>
</channel>
</rss>
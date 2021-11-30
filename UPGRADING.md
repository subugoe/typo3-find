# Upgrading the find extension

## Solarium upgrade

The underlying solarium library has been updated. Find tries so do this as smooth as possible
for you.

Solr has a slightly changed syntax for connecting now, see [here](https://solarium.readthedocs.io/en/stable/getting-started/#pitfall-when-upgrading-from-earlier-versions-to-5x).

This is the actual syntax:

```
plugin.tx_find.settings {
    connections {
        default {
            options {
                host = solr.local
                port = 8983
                path = /
                scheme = http
                collection = myIndex
            }
        }
    }
}
```


The connection configuration below may still work, but a deprecation notice is thrown - so
please change the settings.

```
plugin.tx_find.settings {
    connections {
        default {
            options {
                host = solr.local
                port = 8080
                path = /solr/myIndex
            }
        }
    }
}
```

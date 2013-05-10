# ps -C $1 -O rss | gawk '{ count ++; sum += $2 }; END {count --; print "Number of processes =",count; print "Memory usage per process =",sum/1024/count, "MB"; print "Total memory usage =", sum/1024, "MB" ;};'

echo "======================================"
echo "Node.js"
echo ""
ps -C node -O rss,pcpu | gawk '{ count ++; memory += $2; cpu += $3 }; END {count --; print count,"x"; print "Memory:", memory/1024, "MB"; print "CPU:",cpu/count, "%"; };'

echo "======================================"
echo "MongoDB"
echo ""
ps -C mongod -O rss,pcpu | gawk '{ count ++; memory += $2; cpu += $3 }; END {count --; print count,"x"; print "Memory:", memory/1024, "MB"; print "CPU:",cpu/count, "%"; };'

echo "======================================"
echo "Redis"
echo ""
ps -C redis-server -O rss,pcpu | gawk '{ count ++; memory += $2; cpu += $3 }; END {count --; print count,"x"; print "Memory:", memory/1024, "MB"; print "CPU:",cpu/count, "%"; };'

echo "======================================"
echo "NginX"
echo ""
ps -C nginx -O rss,pcpu | gawk '{ count ++; memory += $2; cpu += $3 }; END {count --; print count,"x"; print "Memory: ", memory/1024, "MB"; print "CPU:",cpu/count, "%"; };'
echo "======================================"

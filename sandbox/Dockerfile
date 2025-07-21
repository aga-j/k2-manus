FROM ubuntu:22.04
RUN apt-get update && apt-get install -y python3 python3-pip curl && \
    pip3 install playwright && \
    playwright install chromium
COPY sandbox/tools.py /tools.py
WORKDIR /
ENTRYPOINT ["tail","-f","/dev/null"]
